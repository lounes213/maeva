import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '@/app/models/Product';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary configuration is missing. Please check your environment variables.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function for error responses
const errorResponse = (message: string, status: number = 500) => {
  return NextResponse.json(
    { 
      success: false, 
      message,
      error: true,
      data: null
    },
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
};

// Helper function for success responses
const successResponse = (data: any, message: string = "Success", status: number = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      error: false,
      data
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
};

// Helper function to handle image uploads
async function handleImageUpload(image: File): Promise<string | undefined> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary configuration is missing');
    }

    if (image.size > 5 * 1024 * 1024) {
      console.warn(`Skipping large image: ${image.name}`);
      return undefined;
    }

    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const dataURI = `data:${image.type};base64,${base64Image}`;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataURI, {
        folder: 'products',
        resource_type: 'auto',
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return (result as any).secure_url;
  } catch (error) {
    console.error(`Error uploading image ${image.name}:`, error);
    throw error;
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET all products or single product
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const product = await Product.findById(id);
      if (!product) return errorResponse('Produit non trouvé', 404);
      return successResponse(product);
    }

    const products = await Product.find({}).sort({ createdAt: -1 });
    return successResponse(products);
  } catch (error) {
    return errorResponse('Échec de la récupération des produits');
  }
}

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

    // Generate a unique reference
    const reference = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Process images
    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    
    for (const image of images) {
      try {
        const imageUrl = await handleImageUpload(image);
        if (imageUrl) {
          imageUrls.push(imageUrl);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        return errorResponse("Failed to upload image. Please try again.");
      }
    }

    // Process colors and sizes
    const couleurs = formData.getAll('couleurs') as string[];
    const taille = formData.getAll('taille') as string[];

    // Create product
    await dbConnect();
    const product = await Product.create({
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string,
      reference,
      tissu: formData.get('tissu') as string || '',
      couleurs: couleurs,
      taille: taille,
      sold: parseInt(formData.get('sold') as string) || 0,
      promotion: formData.get('promotion') === 'true',
      reviews: formData.get('reviews') as string || '',
      deliveryDate: formData.get('deliveryDate') as string || undefined,
      deliveryAddress: formData.get('deliveryAddress') as string || '',
      deliveryStatus: formData.get('deliveryStatus') as string || '',
      imageUrls,
    });

    return successResponse(product, 'Produit créé avec succès', 201);

  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse(`Échec de la création du produit: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      // Remplace l'utilisation de `arrayBuffer()` par une méthode compatible avec Node.js
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
        description: formData.get('description') || existingProduct.description,
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : existingProduct.price,
        stock: formData.get('stock') ? parseInt(formData.get('stock') as string) : existingProduct.stock,
        category: formData.get('category') as string || existingProduct.category,
        tissu: formData.get('tissu') as string || existingProduct.tissu,
        couleurs: couleurs,
        taille: taille,
        sold: formData.get('sold') ? parseInt(formData.get('sold') as string) : existingProduct.sold,
        promotion: formData.get('promotion') ? formData.get('promotion') === 'true' : existingProduct.promotion,
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
