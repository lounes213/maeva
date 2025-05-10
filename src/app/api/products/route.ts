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
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Required fields
    const requiredFields = ['name', 'description', 'price', 'stock', 'category', 'reference'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return errorResponse(`Le champ ${field} est requis`, 400);
      }
    }

    // Validate price and stock are valid numbers
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    
    if (isNaN(price) || price < 0) {
      return errorResponse('Le prix doit être un nombre valide supérieur ou égal à 0', 400);
    }
    
    if (isNaN(stock) || stock < 0) {
      return errorResponse('Le stock doit être un nombre valide supérieur ou égal à 0', 400);
    }

    // Check if reference is unique
    await dbConnect();
    const existingProduct = await Product.findOne({ reference: formData.get('reference') });
    if (existingProduct) {
      return errorResponse('Cette référence de produit existe déjà', 400);
    }

    // Process images
    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    
    if (images.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/products');
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const image of images) {
          if (!image || !image.name) {
            console.warn('Image invalide ou sans nom, ignorée.');
            continue;
          }

          if (image.size > 5 * 1024 * 1024) {
            console.warn(`Image ${image.name} trop grande, ignorée.`);
            continue;
          }

          const buffer = await image.arrayBuffer();
          const fileExtension = image.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExtension}`;
          const filePath = path.join(uploadDir, fileName);

          await fs.promises.writeFile(filePath, Buffer.from(buffer));
          imageUrls.push(`/uploads/products/${fileName}`);
        }
      } catch (error) {
        console.error('Erreur lors du traitement des images:', error);
        return errorResponse('Erreur lors du traitement des images', 500);
      }
    }

    // Process colors and sizes
    const couleurs = formData.getAll('couleurs') as string[];
    const taille = formData.getAll('taille') as string[];

    // Create product
    const product = await Product.create({
      name: formData.get('name'),
      reference: formData.get('reference'),
      description: formData.get('description'),
      price,
      stock,
      category: formData.get('category') as string,
      tissu: formData.get('tissu') as string || '',
      couleurs: couleurs,
      taille: taille,
      sold: parseInt(formData.get('sold') as string) || 0,
      promotion: formData.get('promotion') === 'true',
      promoPrice: formData.get('promoPrice') ? parseFloat(formData.get('promoPrice') as string) : undefined,
      rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : 0,
      reviewCount: formData.get('reviewCount') ? parseInt(formData.get('reviewCount') as string) : 0,
      reviews: formData.get('reviews') as string || '',
      deliveryDate: formData.get('deliveryDate') as string || undefined,
      deliveryAddress: formData.get('deliveryAddress') as string || '',
      deliveryStatus: formData.get('deliveryStatus') as string || '',
      imageUrls,
    });

    return NextResponse.json({ 
      success: true, 
      data: product,
      message: 'Produit créé avec succès' 
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
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

    const formData = await req.formData();
    await dbConnect();

    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) return errorResponse('Produit non trouvé', 404);

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

        // Lire le fichier en tant que Buffer
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

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: formData.get('name') || existingProduct.name,
        reference: formData.get('reference') || existingProduct.reference, // Added reference field
        description: formData.get('description') || existingProduct.description,
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : existingProduct.price,
        stock: formData.get('stock') ? parseInt(formData.get('stock') as string) : existingProduct.stock,
        category: formData.get('category') as string || existingProduct.category,
        tissu: formData.get('tissu') as string || existingProduct.tissu,
        couleurs: couleurs,
        taille: taille,
        sold: formData.get('sold') ? parseInt(formData.get('sold') as string) : existingProduct.sold,
        promotion: formData.get('promotion') ? formData.get('promotion') === 'true' : existingProduct.promotion,
        promoPrice: formData.get('promoPrice') ? parseFloat(formData.get('promoPrice') as string) : existingProduct.promoPrice,
        rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : existingProduct.rating,
        reviewCount: formData.get('reviewCount') ? parseInt(formData.get('reviewCount') as string) : existingProduct.reviewCount,
        reviews: formData.get('reviews') as string || existingProduct.reviews,
        deliveryDate: formData.get('deliveryDate') as string || existingProduct.deliveryDate,
        deliveryAddress: formData.get('deliveryAddress') as string || existingProduct.deliveryAddress,
        deliveryStatus: formData.get('deliveryStatus') as string || existingProduct.deliveryStatus,
        imageUrls,
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