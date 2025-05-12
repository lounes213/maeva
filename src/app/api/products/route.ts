import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '@/app/models/Product';

// Helper function for error responses
const errorResponse = (message: string, status: number = 500) => {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
};

// Helper function for detailed error logging
const logError = (error: any) => {
  console.error('Erreur API:', error);
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erreur inconnue';
};

// GET all products or single product
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const product = await Product.findById(id);
      if (!product) return errorResponse('Produit non trouvé', 404);
      return NextResponse.json({ success: true, data: product });
    }

    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return errorResponse('Échec de la récupération des produits');
  }
}

// POST - Create new product
// POST - Create new product
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Required fields
    const requiredFields = ['name', 'description', 'price', 'stock', 'category'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return errorResponse(`${field} est requis`, 400);
      }
    }

    // Process images
    const imageFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    
    for (const image of imageFiles) {
      if (image.size > 0) {
        const buffer = await image.arrayBuffer();
        const fileExtension = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/products');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        imageUrls.push(`/uploads/products/${fileName}`);
      }
    }

    // Create product
    await dbConnect();
    const product = await Product.create({
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category'),
      tissu: formData.get('tissu') || '',
      couleurs: (formData.getAll('couleurs') as string[]).filter(Boolean),
      taille: (formData.getAll('taille') as string[]).filter(Boolean),
      sold: parseInt(formData.get('sold') as string) || 0,
      promotion: formData.get('promotion') === 'true',
      image: imageUrls.length === 1 ? imageUrls[0] : imageUrls
    });

    return NextResponse.json({ 
      success: true, 
      data: product,
      message: 'Produit créé avec succès' 
    });
  } catch (error) {
    const errorMessage = logError(error);
    return errorResponse(`Échec de la création du produit: ${errorMessage}`);
  }
}

// PUT - Update product
// PUT - Update product
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID du produit est requis', 400);

    const formData = await req.formData();
    await dbConnect();

    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) return errorResponse('Produit non trouvé', 404);

    // Process images - handle both single and multiple images
    const imageFiles = formData.getAll('images') as File[];
    let currentImages = Array.isArray(existingProduct.image) 
      ? existingProduct.image 
      : existingProduct.image ? [existingProduct.image] : [];

    // Handle new image uploads
    const newImages: string[] = [];
    for (const image of imageFiles) {
      if (image.size > 0) {
        const buffer = await image.arrayBuffer();
        const fileExtension = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/products');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        newImages.push(`/uploads/products/${fileName}`);
      }
    }

    // Handle image removals if needed
    const imagesToRemove = formData.get('imagesToRemove') 
      ? JSON.parse(formData.get('imagesToRemove') as string) as string[]
      : [];

    // Clean up removed images
    for (const imageUrl of imagesToRemove) {
      const filePath = path.join(process.cwd(), 'public', imageUrl);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    // Filter out removed images
    const remainingImages = currentImages.filter((img: string) => !imagesToRemove.includes(img));
    const allImages = [...remainingImages, ...newImages];

    // Process other fields
    const updateData = {
      name: formData.get('name') || existingProduct.name,
      description: formData.get('description') || existingProduct.description,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : existingProduct.price,
      stock: formData.get('stock') ? parseInt(formData.get('stock') as string) : existingProduct.stock,
      category: formData.get('category') || existingProduct.category,
      tissu: formData.get('tissu') || existingProduct.tissu,
      couleurs: formData.getAll('couleurs').length > 0 
        ? (formData.getAll('couleurs') as string[]).filter(Boolean) 
        : existingProduct.couleurs,
      taille: formData.getAll('taille').length > 0
        ? (formData.getAll('taille') as string[]).filter(Boolean)
        : existingProduct.taille,
      sold: formData.get('sold') ? parseInt(formData.get('sold') as string) : existingProduct.sold,
      promotion: formData.get('promotion') ? formData.get('promotion') === 'true' : existingProduct.promotion,
      image: allImages.length === 1 ? allImages[0] : allImages
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      data: updatedProduct,
      message: 'Produit mis à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return errorResponse('Échec de la mise à jour du produit');
  }
}


export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'ID du produit est requis' },
        { status: 400 }
      );
    }

    await dbConnect();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Check if running locally (skip deletion on Netlify/Vercel)
    const isLocal = process.env.NODE_ENV === 'development';

    if (isLocal && product.imageUrls && product.imageUrls.length > 0) {
      for (const imageUrl of product.imageUrls) {
        const fileName = imageUrl.split('/').pop();
        if (!fileName) continue;

        const filePath = path.join(process.cwd(), 'public', 'uploads', 'products', fileName);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur de suppression:', error);
    return NextResponse.json(
      { error: error.message || 'Échec de la suppression du produit' },
      { status: 500 }
    );
  }
}
