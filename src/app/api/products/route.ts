import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import { Product } from '@/app/models/Product';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function handleImageUpload(imageFile: File | null): Promise<string | undefined> {
  if (!imageFile || imageFile.size === 0) return undefined;

  // Validate file size
  if (imageFile.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Validate file type
  const fileType = mime.lookup(imageFile.name);
  if (!fileType || !ALLOWED_FILE_TYPES.includes(fileType)) {
    throw new Error(`Only ${ALLOWED_FILE_TYPES.join(', ')} files are allowed`);
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads/products');
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
  return `/uploads/products/${filename}`;
}

async function cleanupOldImage(imageUrl: string | undefined) {
  if (!imageUrl) return;
  
  try {
    const filepath = path.join(process.cwd(), 'public', imageUrl);
    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
    } catch (err) {
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

    // Required fields validation
    const requiredFields = ['name', 'description', 'price', 'stock', 'category', 'reference'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Validate price and stock
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'Le prix doit être un nombre valide supérieur ou égal à 0' },
        { status: 400 }
      );
    }
    
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { error: 'Le stock doit être un nombre valide supérieur ou égal à 0' },
        { status: 400 }
      );
    }

    // Check for duplicate reference
    const existingProduct = await Product.findOne({ reference: formData.get('reference') });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Cette référence de produit existe déjà' },
        { status: 400 }
      );
    }

    // Handle image uploads
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

    // Create new product
    const newProduct = new Product({
      name: formData.get('name'),
      reference: formData.get('reference'),
      description: formData.get('description'),
      price,
      stock,
      category: formData.get('category'),
      tissu: formData.get('tissu') || '',
      couleurs: formData.getAll('couleurs'),
      taille: formData.getAll('taille'),
      sold: parseInt(formData.get('sold') as string) || 0,
      promotion: formData.get('promotion') === 'true',
      promoPrice: formData.get('promoPrice') ? parseFloat(formData.get('promoPrice') as string) : undefined,
      rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : 0,
      reviewCount: formData.get('reviewCount') ? parseInt(formData.get('reviewCount') as string) : 0,
      reviews: formData.get('reviews') || '',
      deliveryDate: formData.get('deliveryDate'),
      deliveryAddress: formData.get('deliveryAddress') || '',
      deliveryStatus: formData.get('deliveryStatus') || '',
      imageUrls: uploadedImages,
    });

    const savedProduct = await newProduct.save();
    return NextResponse.json({ data: savedProduct }, { status: 201 });

  } catch (err: any) {
    console.error('POST Error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: product });
    }

    const query: any = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });

  } catch (err: any) {
    console.error('GET Error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'ID du produit est requis' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[];
    let imageUrls = existingProduct.imageUrls || [];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const imageUrl = await handleImageUpload(file);
          if (imageUrl) imageUrls.push(imageUrl);
        } catch (err: any) {
          console.error('Error uploading image:', err);
        }
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: formData.get('name') || existingProduct.name,
        reference: formData.get('reference') || existingProduct.reference,
        description: formData.get('description') || existingProduct.description,
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : existingProduct.price,
        stock: formData.get('stock') ? parseInt(formData.get('stock') as string) : existingProduct.stock,
        category: formData.get('category') || existingProduct.category,
        tissu: formData.get('tissu') || existingProduct.tissu,
        couleurs: formData.getAll('couleurs').length > 0 ? formData.getAll('couleurs') : existingProduct.couleurs,
        taille: formData.getAll('taille').length > 0 ? formData.getAll('taille') : existingProduct.taille,
        sold: formData.get('sold') ? parseInt(formData.get('sold') as string) : existingProduct.sold,
        promotion: formData.get('promotion') ? formData.get('promotion') === 'true' : existingProduct.promotion,
        promoPrice: formData.get('promoPrice') ? parseFloat(formData.get('promoPrice') as string) : existingProduct.promoPrice,
        rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : existingProduct.rating,
        reviewCount: formData.get('reviewCount') ? parseInt(formData.get('reviewCount') as string) : existingProduct.reviewCount,
        reviews: formData.get('reviews') || existingProduct.reviews,
        deliveryDate: formData.get('deliveryDate') || existingProduct.deliveryDate,
        deliveryAddress: formData.get('deliveryAddress') || existingProduct.deliveryAddress,
        deliveryStatus: formData.get('deliveryStatus') || existingProduct.deliveryStatus,
        imageUrls,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedProduct });

  } catch (err: any) {
    console.error('PUT Error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'ID du produit est requis' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Clean up product images
    if (product.imageUrls && product.imageUrls.length > 0) {
      for (const imageUrl of product.imageUrls) {
        await cleanupOldImage(imageUrl);
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès',
    });

  } catch (err: any) {
    console.error('DELETE Error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}