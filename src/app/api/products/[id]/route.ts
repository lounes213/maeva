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
) {
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
) {
  try {
    const id = params.id;
    const idError = validateProductId(id);
    if (idError) {
      return errorResponse(idError, 400);
    }

    const formData = await request.formData();
    await dbConnect();
    
    // Rest of your PUT implementation remains the same...
    // [Previous PUT implementation code here]
    
  } catch (error) {
    const errorMessage = logError(error);
    return errorResponse(`Échec de la mise à jour du produit: ${errorMessage}`);
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const idError = validateProductId(id);
    if (idError) {
      return errorResponse(idError, 400);
    }
    
    // Rest of your DELETE implementation remains the same...
    // [Previous DELETE implementation code here]
    
  } catch (error) {
    const errorMessage = logError(error);
    return errorResponse(`Échec de la suppression du produit: ${errorMessage}`);
  }
}