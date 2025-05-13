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
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Si un ID est fourni, retourner un produit spécifique
    if (id) {
      const product = await Product.findById(id);
      if (!product) return errorResponse('Produit non trouvé', 404);
      return NextResponse.json({ success: true, data: product });
    }

    // Construire la requête de recherche
    const query: any = {};

    // Ajouter la recherche textuelle si fournie
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'categories.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Filtrer par catégorie si fournie
    if (category) {
      query['categories.slug'] = category;
    }

    // Calculer le nombre total de produits correspondant à la requête
    const total = await Product.countDocuments(query);
    
    // Récupérer les produits avec pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ 
      success: true, 
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return errorResponse('Échec de la récupération des produits');
  }
}

// POST - Create new product
export async function POST(req: Request) {
  try {
    // For JSON requests from the frontend
    if (req.headers.get('content-type')?.includes('application/json')) {
      const data = await req.json();
      
      // Required fields validation
      const requiredFields = ['name', 'description', 'price', 'stock', 'category', 'reference'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return errorResponse(`${field} est requis`, 400);
        }
      }

      // Create product with Cloudinary image URLs
      await dbConnect();
      const product = await Product.create({
        name: data.name,
        reference: data.reference,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        category: data.category,
        tissu: data.tissu || '',
        couleurs: Array.isArray(data.couleurs) ? data.couleurs : [],
        taille: Array.isArray(data.taille) ? data.taille : [],
        sold: parseInt(data.sold) || 0,
        promotion: Boolean(data.promotion),
        promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : undefined,
        rating: data.rating ? parseFloat(data.rating) : 0,
        reviewCount: data.reviewCount ? parseInt(data.reviewCount) : 0,
        images: data.images || [],
        imageUrls: data.images || [] // Store in both fields for compatibility
      });

      return NextResponse.json({ 
        success: true, 
        data: product,
        message: 'Produit créé avec succès' 
      });
    } 
    // For FormData requests (legacy support)
    else {
      const formData = await req.formData();
      
      // Required fields
      const requiredFields = ['name', 'description', 'price', 'stock', 'category', 'reference'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          return errorResponse(`${field} est requis`, 400);
        }
      }

      // We don't process images here anymore - they should be uploaded to Cloudinary first
      // and the URLs should be passed in the request

      // Create product
      await dbConnect();
      const product = await Product.create({
        name: formData.get('name'),
        reference: formData.get('reference'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string),
        category: formData.get('category'),
        tissu: formData.get('tissu') || '',
        couleurs: (formData.getAll('couleurs') as string[]).filter(Boolean),
        taille: (formData.getAll('taille') as string[]).filter(Boolean),
        sold: parseInt(formData.get('sold') as string) || 0,
        promotion: formData.get('promotion') === 'true',
        promoPrice: formData.get('promoPrice') ? parseFloat(formData.get('promoPrice') as string) : undefined,
        // Use the image URLs passed from the frontend
        images: formData.getAll('images') as string[],
        imageUrls: formData.getAll('images') as string[]
      });

      return NextResponse.json({ 
        success: true, 
        data: product,
        message: 'Produit créé avec succès' 
      });
    }
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
    
    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) return errorResponse('Produit non trouvé', 404);

    // For JSON requests from the frontend
    if (req.headers.get('content-type')?.includes('application/json')) {
      const data = await req.json();
      
      // Get existing images
      const existingImages = existingProduct.images || 
                            (existingProduct.imageUrls || []) || 
                            (Array.isArray(existingProduct.image) ? existingProduct.image : 
                              existingProduct.image ? [existingProduct.image] : []);
      
      // Combine existing and new images
      const allImages = [...(data.images || [])];
      
      // Update data
      const updateData = {
        name: data.name || existingProduct.name,
        reference: data.reference || existingProduct.reference,
        description: data.description || existingProduct.description,
        price: data.price !== undefined ? parseFloat(data.price) : existingProduct.price,
        stock: data.stock !== undefined ? parseInt(data.stock) : existingProduct.stock,
        category: data.category || existingProduct.category,
        tissu: data.tissu || existingProduct.tissu,
        couleurs: Array.isArray(data.couleurs) ? data.couleurs : existingProduct.couleurs,
        taille: Array.isArray(data.taille) ? data.taille : existingProduct.taille,
        sold: data.sold !== undefined ? parseInt(data.sold) : existingProduct.sold,
        promotion: data.promotion !== undefined ? Boolean(data.promotion) : existingProduct.promotion,
        promoPrice: data.promoPrice !== undefined ? parseFloat(data.promoPrice) : existingProduct.promoPrice,
        rating: data.rating !== undefined ? parseFloat(data.rating) : existingProduct.rating,
        reviewCount: data.reviewCount !== undefined ? parseInt(data.reviewCount) : existingProduct.reviewCount,
        images: allImages,
        imageUrls: allImages // Store in both fields for compatibility
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
    }
    // For FormData requests (legacy support)
    else {
      const formData = await req.formData();
      
      // Get existing images from various possible fields
      let existingImages = [];
      if (existingProduct.images && existingProduct.images.length > 0) {
        existingImages = existingProduct.images;
      } else if (existingProduct.imageUrls && existingProduct.imageUrls.length > 0) {
        existingImages = existingProduct.imageUrls;
      } else if (existingProduct.image) {
        existingImages = Array.isArray(existingProduct.image) ? existingProduct.image : [existingProduct.image];
      }
      
      // Handle image removals if needed
      const imagesToRemove = formData.get('imagesToRemove') 
        ? JSON.parse(formData.get('imagesToRemove') as string) as string[]
        : [];
      
      // Filter out removed images - no need to delete files from disk
      const remainingImages = existingImages.filter((img: string) => !imagesToRemove.includes(img));
      
      // Get new images from form data (these should be URLs, not files)
      const newImageUrls = formData.getAll('images') as string[];
      const allImages = [...remainingImages, ...newImageUrls.filter(url => typeof url === 'string' && url.startsWith('http'))];

      // Process other fields
      const updateData = {
        name: formData.get('name') || existingProduct.name,
        reference: formData.get('reference') || existingProduct.reference,
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
        promoPrice: formData.get('promoPrice') ? parseFloat(formData.get('promoPrice') as string) : existingProduct.promoPrice,
        images: allImages,
        imageUrls: allImages
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
    }
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

    // Note: We're not deleting files from the file system anymore
    // Images stored in Cloudinary would need to be deleted via Cloudinary API
    // if that functionality is needed in the future

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès',
    });
  } catch (error: any) {
    const errorMessage = logError(error);
    return errorResponse(`Échec de la suppression du produit: ${errorMessage}`);
  }
}
