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

// GET all products or single product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await dbConnect();

    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return errorResponse('Produit non trouvé', 404);
      }
      return NextResponse.json({ success: true, data: product });
    }

    const products = await Product.find({});
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    const errorMessage = logError(error);
    return errorResponse(`Échec de la récupération des produits: ${errorMessage}`);
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    console.log('Starting POST request processing...');
    
    console.log('Parsing form data...');
    const formData = await request.formData();
    console.log('Form data parsed successfully');

    console.log('Connecting to database...');
    await dbConnect();
    
    // Process images
    console.log('Processing images...');
    const images = formData.getAll('images') as File[];
    console.log('Number of images:', images.length);
    const imageUrls: string[] = [];

    if (images.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/products');
      console.log('Upload directory:', uploadDir);
      
      if (!fs.existsSync(uploadDir)) {
        console.log('Creating upload directory...');
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const image of images) {
        if (!image || !image.name) {
          console.warn('Invalid image or missing name, skipping...');
          continue;
        }

        if (image.size > 5 * 1024 * 1024) {
          console.warn('Image too large, skipping:', image.name);
          continue;
        }

        const fileExtension = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        console.log('Saving image:', fileName);

        try {
          const buffer = Buffer.from(await image.arrayBuffer());
          await fs.promises.writeFile(filePath, buffer);
          imageUrls.push(`/uploads/products/${fileName}`);
          console.log('Image saved successfully:', fileName);
        } catch (error) {
          console.error('Error saving image:', error);
          continue;
        }
      }
    }

    // Process colors and sizes
    console.log('Processing colors and sizes...');
    const couleurs = formData.getAll('couleurs') as string[];
    const taille = formData.getAll('taille') as string[];
    console.log('Colors:', couleurs);
    console.log('Sizes:', taille);

    // Validate required fields
    console.log('Validating required fields...');
    const requiredFields = ['name', 'reference', 'description', 'price', 'stock', 'category'];
    const missingFields = requiredFields.filter(field => !formData.get(field));
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Champs requis manquants', 
          details: `Les champs suivants sont requis: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Prepare product data
    console.log('Preparing product data...');
    const productData = {
      name: formData.get('name')?.toString(),
      reference: formData.get('reference')?.toString(),
      description: formData.get('description')?.toString(),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category')?.toString(),
      tissu: formData.get('tissu')?.toString() || '',
      couleurs: couleurs,
      taille: taille,
      sold: parseInt(formData.get('sold') as string) || 0,
      promotion: formData.get('promotion') === 'true',
      promoPrice: formData.get('promotion') === 'true' ? parseFloat(formData.get('promoPrice') as string) : undefined,
      reviews: formData.get('reviews')?.toString() || '',
      rating: parseFloat(formData.get('rating') as string) || 0,
      reviewCount: parseInt(formData.get('reviewCount') as string) || 0,
      imageUrls,
      deliveryDate: formData.get('deliveryDate')?.toString() || '',
      deliveryAddress: formData.get('deliveryAddress')?.toString() || '',
      deliveryStatus: formData.get('deliveryStatus')?.toString() || ''
    };

    console.log('Product data prepared:', productData);

    // Validate product data
    console.log('Validating product data...');
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

    console.log('Creating product...');
    // Create product with validated data
    const product = await Product.create(validation.data);
    console.log('Product created successfully:', product._id);
    
    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produit créé avec succès'
    });

  } catch (error) {
    console.error('Error in POST /api/products:', error);
    const errorMessage = logError(error);
    return errorResponse(`Échec de la création du produit: ${errorMessage}`);
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    console.log('Starting PUT request processing...');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Product ID:', id);
    
    if (!id) {
      console.log('No ID provided');
      return errorResponse('ID du produit manquant', 400);
    }

    const idError = validateProductId(id);
    if (idError) {
      console.log('Invalid ID:', idError);
      return errorResponse(idError, 400);
    }

    console.log('Connecting to database...');
    await dbConnect();
    
    // Find existing product
    console.log('Finding existing product...');
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      console.log('Product not found');
      return errorResponse('Produit non trouvé', 404);
    }
    console.log('Existing product found:', existingProduct._id);

    // Get form data
    let formData;
    try {
      console.log('Parsing form data...');
      formData = await request.formData();
      console.log('Form data parsed successfully');
    } catch (error) {
      console.error('Error parsing form data:', error);
      return errorResponse('Erreur lors du traitement des données du formulaire', 400);
    }

    // Process new images
    let imageUrls = existingProduct.imageUrls || [];
    try {
      console.log('Processing images...');
      const newImages = formData.getAll('images') as File[];
      console.log('Number of new images:', newImages.length);

      if (newImages.length > 0) {
        const uploadDir = path.join(process.cwd(), 'public/uploads/products');
        console.log('Upload directory:', uploadDir);
        
        if (!fs.existsSync(uploadDir)) {
          console.log('Creating upload directory...');
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const image of newImages) {
          if (!image || !image.name) {
            console.warn('Invalid image or missing name, skipping...');
            continue;
          }

          if (image.size > 5 * 1024 * 1024) {
            console.warn('Image too large, skipping:', image.name);
            continue;
          }

          const fileExtension = image.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExtension}`;
          const filePath = path.join(uploadDir, fileName);
          console.log('Saving image:', fileName);

          try {
            const buffer = Buffer.from(await image.arrayBuffer());
            await fs.promises.writeFile(filePath, buffer);
            imageUrls.push(`/uploads/products/${fileName}`);
            console.log('Image saved successfully:', fileName);
          } catch (error) {
            console.error('Error saving image:', error);
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Error processing images:', error);
      // Continue with existing images if there's an error
    }

    // Process colors and sizes with fallbacks
    console.log('Processing colors and sizes...');
    const couleurs = formData.getAll('couleurs').length > 0 
      ? formData.getAll('couleurs') as string[] 
      : existingProduct.couleurs || [];
    
    const taille = formData.getAll('taille').length > 0
      ? formData.getAll('taille') as string[]
      : existingProduct.taille || [];

    // Prepare product data with safe fallbacks
    console.log('Preparing product data...');
    const productData = {
      name: formData.get('name')?.toString() || existingProduct.name,
      reference: formData.get('reference')?.toString() || existingProduct.reference,
      description: formData.get('description')?.toString() || existingProduct.description,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : existingProduct.price,
      stock: formData.get('stock') ? parseInt(formData.get('stock') as string) : existingProduct.stock,
      category: formData.get('category')?.toString() || existingProduct.category,
      tissu: formData.get('tissu')?.toString() || existingProduct.tissu,
      couleurs: couleurs,
      taille: taille,
      sold: formData.get('sold') ? parseInt(formData.get('sold') as string) : existingProduct.sold || 0,
      promotion: formData.get('promotion') ? formData.get('promotion') === 'true' : existingProduct.promotion || false,
      promoPrice: formData.get('promotion') === 'true' ? parseFloat(formData.get('promoPrice') as string) : existingProduct.promoPrice,
      reviews: formData.get('reviews')?.toString() || existingProduct.reviews || '',
      rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : existingProduct.rating || 0,
      reviewCount: formData.get('reviewCount') ? parseInt(formData.get('reviewCount') as string) : existingProduct.reviewCount || 0,
      imageUrls,
      deliveryDate: formData.get('deliveryDate')?.toString() || existingProduct.deliveryDate || '',
      deliveryAddress: formData.get('deliveryAddress')?.toString() || existingProduct.deliveryAddress || '',
      deliveryStatus: formData.get('deliveryStatus')?.toString() || existingProduct.deliveryStatus || ''
    };

    console.log('Validating product data...');
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

    console.log('Updating product...');
    // Update product with validated data
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      console.error('Failed to update product');
      return errorResponse('Échec de la mise à jour du produit', 500);
    }
    
    console.log('Product updated successfully');
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Produit mis à jour avec succès' 
    });

  } catch (error) {
    console.error('Error in PUT /api/products:', error);
    const errorMessage = logError(error);
    return errorResponse(`Échec de la mise à jour du produit: ${errorMessage}`);
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return errorResponse('ID du produit manquant', 400);
    }

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
