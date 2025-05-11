import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import { Product } from '@/app/models/Product';
import path from 'path';
import { writeFile } from 'fs/promises';
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
    await writeFile(path.join(uploadDir, imageFile.name), Buffer.from(await imageFile.arrayBuffer()));
  } catch (err) {
    console.error('Error processing image:', err);
    return undefined;
  }

  return `/uploads/products/${imageFile.name}`;
}

async function cleanupOldImage(imageUrl: string | undefined) {
  if (!imageUrl) return;
  
  try {
    const filepath = path.join(process.cwd(), 'public', imageUrl);
    try {
      await writeFile(filepath, Buffer.from([]));
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
    console.log('Connected to database');

    const formData = await req.formData();
    console.log('Received form data:', Object.fromEntries(formData.entries()));

    // Validate required fields
    const requiredFields = ['name', 'reference', 'description', 'price', 'stock', 'category'];
    const missingFields = requiredFields.filter(field => !formData.get(field));
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate price and stock
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));

    if (isNaN(price) || price < 0) {
      console.error('Invalid price:', formData.get('price'));
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (isNaN(stock) || stock < 0) {
      console.error('Invalid stock:', formData.get('stock'));
      return NextResponse.json(
        { error: 'Stock must be a positive number' },
        { status: 400 }
      );
    }

    // Check for duplicate reference
    const existingProduct = await Product.findOne({ reference: formData.get('reference') });
    if (existingProduct) {
      console.error('Duplicate reference:', formData.get('reference'));
      return NextResponse.json(
        { error: 'A product with this reference already exists' },
        { status: 400 }
      );
    }

    // Process images
    const imageFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (!file || !(file instanceof File)) {
        console.warn('Invalid file:', file);
        continue;
      }

      try {
        const imageUrl = await handleImageUpload(file);
        if (imageUrl) {
          imageUrls.push(imageUrl);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json(
          { error: 'Failed to process image upload' },
          { status: 500 }
        );
      }
    }

    // Create product data
    const productData = {
      name: formData.get('name'),
      reference: formData.get('reference'),
      description: formData.get('description'),
      price,
      stock,
      category: formData.get('category'),
      tissu: formData.get('tissu') || '',
      couleurs: formData.get('couleurs')?.toString().split(',').map(c => c.trim()) || [],
      taille: formData.get('taille')?.toString().split(',').map(t => t.trim()) || [],
      sold: parseInt(formData.get('sold') as string) || 0,
      promotion: formData.get('promotion') === 'true',
      promoPrice: formData.get('promoPrice') ? Number(formData.get('promoPrice')) : undefined,
      rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : 0,
      reviewCount: formData.get('reviewCount') ? parseInt(formData.get('reviewCount') as string) : 0,
      reviews: formData.get('reviews') || '',
      deliveryDate: formData.get('deliveryDate'),
      deliveryAddress: formData.get('deliveryAddress') || '',
      deliveryStatus: formData.get('deliveryStatus') || '',
      imageUrls,
    };

    console.log('Creating product with data:', productData);

    // Create product
    const product = await Product.create(productData);
    console.log('Product created successfully:', product);

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (id) {
      // Fetch single product
      const product = await Product.findById(id);
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      // Convert numeric fields to numbers
      const formattedProduct = {
        ...product.toObject(),
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        sold: Number(product.sold) || 0,
        promoPrice: product.promoPrice ? Number(product.promoPrice) : undefined,
        rating: product.rating ? Number(product.rating) : 0,
        reviewCount: product.reviewCount ? Number(product.reviewCount) : 0,
      };

      return NextResponse.json({ data: formattedProduct });
    }

    // Fetch multiple products with pagination
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
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(query)
    ]);

    // Format products
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      sold: Number(product.sold) || 0,
      promoPrice: product.promoPrice ? Number(product.promoPrice) : undefined,
      rating: product.rating ? Number(product.rating) : 0,
      reviewCount: product.reviewCount ? Number(product.reviewCount) : 0,
    }));

    return NextResponse.json({ 
      data: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    console.log('Received form data:', Object.fromEntries(formData.entries()));

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
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

    // Process form data
    const updateData: any = {};

    // Handle numeric fields
    const numericFields = ['price', 'stock', 'sold', 'promoPrice', 'rating', 'reviewCount'];
    numericFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== undefined && value !== '') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          updateData[field] = numValue;
        }
      }
    });

    // Handle boolean fields
    if (formData.has('promotion')) {
      updateData.promotion = formData.get('promotion') === 'true';
    }

    // Handle string fields
    const stringFields = ['name', 'reference', 'description', 'category', 'tissu', 'reviews', 'deliveryAddress', 'deliveryStatus'];
    stringFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        updateData[field] = value.toString();
      }
    });

    // Handle arrays
    const couleurs = formData.get('couleurs');
    if (couleurs) {
      updateData.couleurs = couleurs.toString().split(',').map(c => c.trim());
    }

    const taille = formData.get('taille');
    if (taille) {
      updateData.taille = taille.toString().split(',').map(t => t.trim());
    }

    // Handle date fields
    const deliveryDate = formData.get('deliveryDate');
    if (deliveryDate) {
      updateData.deliveryDate = new Date(deliveryDate.toString());
    }

    // Add image URLs
    updateData.imageUrls = imageUrls;

    console.log('Updating product with data:', updateData);

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedProduct });

  } catch (err: any) {
    console.error('PUT Error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
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