import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Collection from '@/app/models/collection';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Parse JSON body
    const data = await req.json();
    const { 
      name, 
      description, 
      status = 'draft', 
      tags = [], 
      isFeatured = false, 
      seoTitle, 
      seoDescription, 
      sortOrder = 0, 
      metadata = {},
      images = [] 
    } = data;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const newCollection = new Collection({
      name,
      description,
      image: images,
      status,
      tags,
      isFeatured,
      seoTitle,
      seoDescription,
      sortOrder,
      metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
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

    // Parse JSON body
    const data = await req.json();
    const existingCollection = await Collection.findById(id);
    if (!existingCollection) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });

    const { 
      name, 
      description, 
      status, 
      isFeatured, 
      seoTitle, 
      seoDescription, 
      tags, 
      sortOrder, 
      metadata,
      newImages = [],
      imagesToRemove = []
    } = data;

    const updateData: any = {
      name,
      description,
      status,
      isFeatured,
      sortOrder: sortOrder || 0,
    };

    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (tags !== undefined) updateData.tags = tags;
    if (metadata !== undefined) updateData.metadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

    // Handle image updates
    const currentImages = Array.isArray(existingCollection.image)
      ? existingCollection.image
      : existingCollection.image ? [existingCollection.image] : [];

    if (imagesToRemove.length > 0) {
      // No need to delete files from disk, just filter them out
      const remainingImages = currentImages.filter(img => !imagesToRemove.includes(img));
      updateData.image = [...remainingImages, ...newImages];
    } else if (newImages.length > 0) {
      updateData.image = [...currentImages, ...newImages];
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

    // No need to delete images from Cloudinary as they are managed separately

    await Collection.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Collection deleted successfully' }, { status: 200 });

  } catch (err: any) {
    console.error('DELETE Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
