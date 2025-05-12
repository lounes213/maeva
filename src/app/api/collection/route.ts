import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Collection from '@/app/models/collection';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constant';

async function handleImageUpload(imageFile: File | null): Promise<string | undefined> {
  if (!imageFile || imageFile.size === 0) return undefined;

  if (imageFile.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  const fileType = mime.lookup(imageFile.name);
  if (!fileType || !ALLOWED_FILE_TYPES.includes(fileType)) {
    throw new Error(`Only ${ALLOWED_FILE_TYPES.join(', ')} files are allowed`);
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads/collections');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const buffer = await imageFile.arrayBuffer();
  const ext = path.extname(imageFile.name);
  const filename = `${uuidv4()}${ext}`;
  const filepath = path.join(uploadDir, filename);

  await fs.writeFile(filepath, Buffer.from(buffer));
  return `/uploads/collections/${filename}`;
}

async function cleanupOldImage(imageUrl: string | undefined) {
  if (!imageUrl) return;
  try {
    const filepath = path.join(process.cwd(), 'public', imageUrl);
    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
    } catch {
      console.error('Image file not found or already deleted:', imageUrl);
    }
  } catch (err) {
    console.error('Error cleaning up old image:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const name = formData.get('name') as string;
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const description = formData.get('description') as string;
    const status = (formData.get('status') as 'published' | 'draft' | 'archived') || 'draft';
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(tag => tag) || [];
    const isFeatured = formData.get('isFeatured') === 'true';
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const metadata = formData.get('metadata') as string;

    const imageFiles = formData.getAll('images') as File[];
    const uploadedImages: string[] = [];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const imageUrl = await handleImageUpload(file);
          if (imageUrl) uploadedImages.push(imageUrl);
        } catch (err: any) {
          console.error('Error uploading image:', err);
        }
      }
    }

    const singleImage = formData.get('image') as File;
    if (singleImage && singleImage.size > 0) {
      try {
        const singleImageUrl = await handleImageUpload(singleImage);
        if (singleImageUrl) uploadedImages.push(singleImageUrl);
      } catch (err: any) {
        console.error('Error uploading single image:', err);
      }
    }

    const newCollection = new Collection({
      name,
      description,
      image: uploadedImages.length === 1 ? uploadedImages[0] : uploadedImages,
      status,
      tags,
      isFeatured,
      seoTitle,
      seoDescription,
      sortOrder,
      metadata: metadata ? JSON.parse(metadata) : {},
    });

    const savedCollection = await newCollection.save();
    return NextResponse.json(savedCollection, { status: 201 });

  } catch (err: any) {
    console.error('POST Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const isFeatured = searchParams.get('isFeatured');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const query: any = {};
    if (status) query.status = status;
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const total = await Collection.countDocuments(query);
    const collections = await Collection.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data: collections,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });

  } catch (err: any) {
    console.error('GET Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const formData = await req.formData();
    const existingCollection = await Collection.findById(id);
    if (!existingCollection) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });

    const updateData: any = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      isFeatured: formData.get('isFeatured') === 'true',
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    };

    if (formData.has('seoTitle')) updateData.seoTitle = formData.get('seoTitle') as string;
    if (formData.has('seoDescription')) updateData.seoDescription = formData.get('seoDescription') as string;
    if (formData.has('tags')) updateData.tags = (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean);
    if (formData.has('metadata')) updateData.metadata = JSON.parse(formData.get('metadata') as string);

    let imagesToRemove: string[] = [];
    if (formData.has('imagesToRemove')) {
      const imagesToRemoveValue = formData.get('imagesToRemove');
      if (typeof imagesToRemoveValue === 'string') {
        try {
          imagesToRemove = JSON.parse(imagesToRemoveValue);
        } catch (e) {
          console.error('Failed to parse imagesToRemove:', e);
        }
      }
    }

    const currentImages = Array.isArray(existingCollection.image)
      ? existingCollection.image
      : existingCollection.image ? [existingCollection.image] : [];

    if (imagesToRemove.length > 0) {
      for (const imageUrl of imagesToRemove) {
        await cleanupOldImage(imageUrl);
      }
      const remainingImages = currentImages.filter(img => !imagesToRemove.includes(img));
      updateData.$set = { image: remainingImages };
    }

    const newImages: string[] = [];
    const imageFiles = formData.getAll('images') as File[];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const imageUrl = await handleImageUpload(file);
          if (imageUrl) newImages.push(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }

    const singleImage = formData.get('image') as File;
    if (singleImage && singleImage.size > 0) {
      try {
        const imageUrl = await handleImageUpload(singleImage);
        if (imageUrl) newImages.push(imageUrl);
      } catch (error) {
        console.error('Error uploading single image:', error);
      }
    }

    if (newImages.length > 0 || imagesToRemove.length > 0) {
      const currentImagesAfterRemoval = updateData.$set?.image || currentImages;
      updateData.$set = updateData.$set || {};
      updateData.$set.image = [...currentImagesAfterRemoval, ...newImages];

      if (Object.keys(updateData.$set).length === 0) {
        delete updateData.$set;
      }
    }

    const updateOptions = { new: true, runValidators: true };
    const updatedCollection = await Collection.findByIdAndUpdate(id, updateData, updateOptions);

    if (!updatedCollection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCollection);

  } catch (err: any) {
    console.error('PUT Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const collection = await Collection.findById(id);
    if (!collection) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });

    if (collection.image) {
      if (Array.isArray(collection.image)) {
        await Promise.all(collection.image.map(imageUrl => cleanupOldImage(imageUrl)));
      } else {
        await cleanupOldImage(collection.image);
      }
    }

    await Collection.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Collection deleted successfully' }, { status: 200 });

  } catch (err: any) {
    console.error('DELETE Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
