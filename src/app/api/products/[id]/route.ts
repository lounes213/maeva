import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/app/models/Product';
import dbConnect from '@/lib/mongo';
import { productSchema } from '@/app/lib/validations/product';
import { validateProductId } from '@/app/lib/validations/productId';

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

// GET a single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const id = params.id;

    // Validate ID format
    const validationError = validateProductId(id);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    const errorMessage = logError(error);
    return NextResponse.json(
      { error: 'Échec de la récupération du produit' },
      { status: 500 }
    );
  }
}

// PUT update a single product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const id = params.id;

    // Validate ID format
    const validationError = validateProductId(id);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Erreur lors du parsing des données du formulaire:', error);
      return NextResponse.json(
        { error: 'Données du formulaire invalides' },
        { status: 400 }
      );
    }

    // Initialize arrays for specific keys
    const arrays = ['imageUrls', 'colors', 'taille', 'materials', 'tags'];
    const productData: any = {};

    // Process form data
    for (const [key, value] of formData.entries()) {
      if (arrays.includes(key)) {
        try {
          productData[key] = JSON.parse(value as string);
        } catch (error) {
          console.error(`Erreur lors du parsing de ${key}:`, error);
          productData[key] = [];
        }
      } else if (key.startsWith('dimensions.')) {
        const dimension = key.split('.')[1];
        productData.dimensions = productData.dimensions || {};
        productData.dimensions[dimension] = parseFloat(value as string) || 0;
      } else if (key === 'promotion' || key === 'featured') {
        productData[key] = value === 'true';
      } else if (key === 'price' || key === 'stock' || key === 'promoPrice' || key === 'weight' || key === 'minOrderQuantity') {
        productData[key] = parseFloat(value as string) || 0;
      } else {
        productData[key] = value;
      }
    }

    // Validate product data
    const validation = productSchema.safeParse(productData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données du produit invalides', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: productData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedProduct });
  } catch (error) {
    const errorMessage = logError(error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

// DELETE a single product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const id = params.id;

    // Validate ID format
    const validationError = validateProductId(id);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: deletedProduct });
  } catch (error) {
    const errorMessage = logError(error);
    return NextResponse.json(
      { error: 'Échec de la suppression du produit' },
      { status: 500 }
    );
  }
} 