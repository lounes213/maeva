import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import { Product } from '@/app/models/Product';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const formData = await req.formData();
    
    const productId = formData.get('productId') as string;
    const rating = Number(formData.get('rating'));
    const comment = formData.get('comment') as string;
    const images = formData.getAll('images') as File[];

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Traiter les images
    const imageUrls: string[] = [];
    for (const image of images) {
      // TODO: Implémenter le stockage des images
      // Pour l'instant, on simule des URLs d'images
      imageUrls.push(`/uploads/reviews/${image.name}`);
    }

    // Créer le nouvel avis
    const newReview = {
      userName: 'Utilisateur', // TODO: Utiliser le vrai nom d'utilisateur
      rating,
      comment,
      images: imageUrls,
      date: new Date().toISOString(),
    };

    // Mettre à jour les avis du produit
    const currentReviews = product.reviews ? JSON.parse(product.reviews) : [];
    const updatedReviews = [...currentReviews, newReview];
    
    // Calculer la nouvelle note moyenne
    const totalRating = updatedReviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    const newRating = totalRating / updatedReviews.length;

    // Mettre à jour le produit
    await Product.findByIdAndUpdate(productId, {
      reviews: JSON.stringify(updatedReviews),
      rating: newRating,
      reviewCount: updatedReviews.length
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/reviews:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'ID du produit manquant' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    const reviews = product.reviews ? JSON.parse(product.reviews) : [];
    return NextResponse.json({ 
      reviews,
      rating: product.rating,
      reviewCount: product.reviewCount
    });
  } catch (error) {
    console.error('Error in /api/reviews:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}