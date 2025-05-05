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
  console.error('Erreur API détaillée:', error);
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
    const errorMessage = logError(error);
    return errorResponse(`Échec de la récupération des produits: ${errorMessage}`);
  }
}

// POST - Create new product
export async function POST(req: Request) {
  try {
    await dbConnect();
    const formData = await req.formData();
    
    // Extract form data safely
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const stockStr = formData.get('stock') as string;
    const category = formData.get('category') as string;
    
    // Required fields validation
    if (!name || !description || !priceStr || !stockStr || !category) {
      return errorResponse('Champs obligatoires manquants', 400);
    }
    
    // Parse numeric values
    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);
    
    if (isNaN(price) || isNaN(stock)) {
      return errorResponse('Valeurs numériques invalides', 400);
    }

    // Process images
    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    
    if (images && images.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/products');
      
      // Create directory if it doesn't exist
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      } catch (dirError) {
        console.error('Erreur lors de la création du répertoire:', dirError);
        // Continue without images if directory creation fails
      }

      // Process each image
      for (const image of images) {
        try {
          if (!image || !image.size || image.size > 5 * 1024 * 1024) {
            continue; // Skip invalid or large files
          }

          const buffer = await image.arrayBuffer();
          const fileExtension = image.name.split('.').pop() || 'jpg';
          const fileName = `${uuidv4()}.${fileExtension}`;
          const filePath = path.join(uploadDir, fileName);

          await fs.promises.writeFile(filePath, Buffer.from(buffer));
          imageUrls.push(`/uploads/products/${fileName}`);
        } catch (imageError) {
          console.error('Erreur lors du traitement de l\'image:', imageError);
          // Continue with other images
        }
      }
    }

    // Process taille (sizes)
    let taille: string[] = [];
    const tailleValue = formData.get('taille');
    
    if (tailleValue) {
      if (Array.isArray(tailleValue)) {
        taille = tailleValue as string[];
      } else if (typeof tailleValue === 'string') {
        // Split comma-separated string into array
        taille = tailleValue.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Process couleurs (colors)
    let couleurs: string[] = [];
    const couleursValue = formData.get('couleurs');
    
    if (couleursValue) {
      if (Array.isArray(couleursValue)) {
        couleurs = couleursValue as string[];
      } else if (typeof couleursValue === 'string') {
        try {
          // Try parsing as JSON if it's a JSON string
          couleurs = JSON.parse(couleursValue);
        } catch {
          // Or split by comma if it's a comma-separated string
          couleurs = couleursValue.split(',').map(c => c.trim()).filter(Boolean);
        }
      }
    }

    // Additional fields with defaults
    const tissu = formData.get('tissu') as string || '';
    const sold = parseInt((formData.get('sold') as string) || '0', 10);
    const promotion = formData.get('promotion') === 'true';
    const promoPrice = promotion ? parseFloat((formData.get('promoPrice') as string) || '0') : 0;
    const rating = parseFloat((formData.get('rating') as string) || '0');
    const reviewCount = parseInt((formData.get('reviewCount') as string) || '0', 10);
    const reference = formData.get('reference') as string || '';

    // Create product document
    const productData = {
      name,
      reference,
      description,
      price,
      stock,
      category,
      tissu,
      couleurs,
      taille,
      sold,
      promotion,
      promoPrice,
      rating,
      reviewCount,
      images: imageUrls, // Ensure field name matches schema
      imageUrls, // Include both for compatibility
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const product = await Product.create(productData);

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
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID du produit est requis', 400);

    await dbConnect();
    const formData = await req.formData();

    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) return errorResponse('Produit non trouvé', 404);

    // Process new images
    const newImages = formData.getAll('images') as File[];
    let imageUrls = existingProduct.imageUrls || [];

    if (newImages && newImages.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/products');
      
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      } catch (dirError) {
        console.error('Erreur lors de la création du répertoire:', dirError);
      }

      for (const image of newImages) {
        try {
          if (!image || !image.size || image.size > 5 * 1024 * 1024) continue;

          const buffer = await image.arrayBuffer();
          const fileExtension = image.name.split('.').pop() || 'jpg';
          const fileName = `${uuidv4()}.${fileExtension}`;
          const filePath = path.join(uploadDir, fileName);

          await fs.promises.writeFile(filePath, Buffer.from(buffer));
          imageUrls.push(`/uploads/products/${fileName}`);
        } catch (imageError) {
          console.error('Erreur lors du traitement de l\'image:', imageError);
        }
      }
    }

    // Process taille (sizes)
    let taille = existingProduct.taille || [];
    const tailleValue = formData.get('taille');
    
    if (tailleValue) {
      if (Array.isArray(tailleValue)) {
        taille = tailleValue as string[];
      } else if (typeof tailleValue === 'string') {
        taille = tailleValue.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Process couleurs (colors)
    let couleurs = existingProduct.couleurs || [];
    const couleursValue = formData.get('couleurs');
    
    if (couleursValue) {
      if (Array.isArray(couleursValue)) {
        couleurs = couleursValue as string[];
      } else if (typeof couleursValue === 'string') {
        try {
          couleurs = JSON.parse(couleursValue);
        } catch {
          couleurs = couleursValue.split(',').map(c => c.trim()).filter(Boolean);
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
        stock: formData.get('stock') ? parseInt(formData.get('stock') as string, 10) : existingProduct.stock,
        category: formData.get('category') || existingProduct.category,
        tissu: formData.get('tissu') || existingProduct.tissu,
        couleurs: couleurs,
        taille: taille,
        sold: formData.get('sold') ? parseInt(formData.get('sold') as string, 10) : existingProduct.sold,
        promotion: formData.get('promotion') === 'true',
        promoPrice: formData.get('promoPrice') ? parseFloat(formData.get('promoPrice') as string) : existingProduct.promoPrice,
        rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : existingProduct.rating,
        reviewCount: formData.get('reviewCount') ? parseInt(formData.get('reviewCount') as string, 10) : existingProduct.reviewCount,
        images: imageUrls, // For schema compatibility
        imageUrls: imageUrls,
        updatedAt: new Date()
      },
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return errorResponse('ID du produit est requis', 400);
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
        try {
          const fileName = imageUrl.split('/').pop();
          if (!fileName) continue;

          const filePath = path.join(process.cwd(), 'public', 'uploads', 'products', fileName);
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        } catch (fileError) {
          console.error('Erreur lors de la suppression du fichier:', fileError);
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