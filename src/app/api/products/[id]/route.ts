import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/app/models/Product';
import dbConnect from '@/lib/mongo';
import { productSchema } from '@/app/lib/validations/product';
import { validateProductId } from '@/app/lib/validations/productId';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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
  if (error.errors) {
    return Object.values(error.errors)
      .map((err: any) => err.message)
      .join(', ');
  }
  return 'Une erreur inconnue est survenue';
};

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    const idError = validateProductId(id);
    if (idError) {
      return errorResponse(idError, 400);
    }

    await dbConnect();
    const product = await Product.findById(id);
    
    if (!product) {
      return errorResponse('Produit non trouvé', 404);
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const errorMessage = logError(error);
    return errorResponse(`Échec de la récupération du produit: ${errorMessage}`);
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    const idError = validateProductId(id);
    if (idError) {
      return errorResponse(idError, 400);
    }

    const formData = await request.formData();
    await dbConnect();
    
    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return errorResponse('Produit non trouvé', 404);
    }

    // Process new images
    const newImages = formData.getAll('images') as File[];
    let imageUrls = existingProduct.imageUrls || [];

    if (newImages.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const image of newImages) {
        if (!image || !image.name) {
          console.warn('Image invalide ou sans nom, ignorée.');
          continue;
        }

        if (image.size > 5 * 1024 * 1024) continue;

        const fileExtension = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        const buffer = Buffer.from(await image.arrayBuffer());
        await fs.promises.writeFile(filePath, buffer);

        imageUrls.push(`/uploads/products/${fileName}`);
      }
    }

    // Process colors and sizes
    const couleurs = formData.getAll('couleurs').length > 0 
      ? formData.getAll('couleurs') as string[] 
      : existingProduct.couleurs;
    
    const taille = formData.getAll('taille').length > 0
      ? formData.getAll('taille') as string[]
      : existingProduct.taille;

    // Prepare product data
    const productData = {
      name: formData.get('name') as string || existingProduct.name,
      reference: formData.get('reference') as string || existingProduct.reference,
      description: formData.get('description') as string || existingProduct.description,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : existingProduct.price,
      stock: formData.get('stock') ? parseInt(formData.get('stock') as string) : existingProduct.stock,
      category: formData.get('category') as string || existingProduct.category,
      tissu: formData.get('tissu') as string || existingProduct.tissu,
      couleurs: couleurs,
      taille: taille,
      sold: formData.get('sold') ? parseInt(formData.get('sold') as string) : existingProduct.sold,
      promotion: formData.get('promotion') ? formData.get('promotion') === 'true' : existingProduct.promotion,
      promoPrice: formData.get('promotion') === 'true' ? parseFloat(formData.get('promoPrice') as string) : existingProduct.promoPrice,
      reviews: formData.get('reviews') as string || existingProduct.reviews,
      rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : existingProduct.rating,
      reviewCount: formData.get('reviewCount') ? parseInt(formData.get('reviewCount') as string) : existingProduct.reviewCount,
      imageUrls,
      deliveryDate: formData.get('deliveryDate') as string || existingProduct.deliveryDate,
      deliveryAddress: formData.get('deliveryAddress') as string || existingProduct.deliveryAddress,
      deliveryStatus: formData.get('deliveryStatus') as string || existingProduct.deliveryStatus
    };

    // Validate product data
    const validation = productSchema.safeParse(productData);
    if (!validation.success) {
      console.error('Validation error:', validation.error.format());
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données du produit invalides', 
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    // Update product with validated data
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return errorResponse('Échec de la mise à jour du produit', 500);
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Produit mis à jour avec succès' 
    });

  } catch (error) {
    const errorMessage = logError(error);
    return errorResponse(`Échec de la mise à jour du produit: ${errorMessage}`);
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    const idError = validateProductId(id);
    if (idError) {
      return errorResponse(idError, 400);
    }
    
    await dbConnect();
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse('Produit non trouvé', 404);
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
  } catch (error) {
    const errorMessage = logError(error);
    return errorResponse(`Échec de la suppression du produit: ${errorMessage}`);
  }
}