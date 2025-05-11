// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/app/models/Product';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongo';

const handleError = (error: unknown, defaultMessage: string) => {
  console.error(defaultMessage, error);
  
  if (error instanceof mongoose.Error.ValidationError) {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    return NextResponse.json(
      { success: false, message: 'Validation failed', errors: validationErrors },
      { status: 400 }
    );
  }
  
  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      { success: false, message: 'Invalid data format' },
      { status: 400 }
    );
  }
  
  if (error instanceof Error && error.message.includes('duplicate key')) {
    return NextResponse.json(
      { success: false, message: 'Product reference must be unique' },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { success: false, message: defaultMessage },
    { status: 500 }
  );
};

// GET all products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Build query from search params
    const category = searchParams.get('category');
    const promotion = searchParams.get('promotion');
    const name = searchParams.get('name');
    const reference = searchParams.get('reference');
    const deliveryStatus = searchParams.get('deliveryStatus');
    
    if (category) query.category = category;
    if (promotion) query.promotion = promotion === 'true';
    if (name) query.name = { $regex: name, $options: 'i' };
    if (reference) query.reference = { $regex: reference, $options: 'i' };
    if (deliveryStatus) query.deliveryStatus = deliveryStatus;

    await dbConnect();
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    // Apply sorting (default: newest first)
    const sortBy = searchParams.get('sortBy') || '-createdAt';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    return handleError(error, 'Failed to fetch products');
  }
}

// CREATE a new product
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body: any = {};
    
    // Process all fields except images
    formData.forEach((value, key) => {
      if (key !== 'images') {
        // Handle arrays and boolean values
        if (key === 'couleurs' || key === 'taille') {
          body[key] = typeof value === 'string' ? value.split(',') : [];
        } else if (key === 'promotion') {
          body[key] = value === 'true';
        } else if (key === 'price' || key === 'stock' || key === 'promoPrice' || 
                  key === 'rating' || key === 'reviewCount' || key === 'sold') {
          body[key] = parseFloat(value as string);
        } else if (key === 'deliveryDate' && value) {
          body[key] = new Date(value as string);
        } else {
          body[key] = value;
        }
      }
    });

    await dbConnect();
    
    // Create new product with validation
    const newProduct = new Product(body);
    const savedProduct = await newProduct.save();
    
    return NextResponse.json(
      { success: true, data: savedProduct },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, 'Failed to create product');
  }
}

// UPDATE a product
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid product ID is required' },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const updates: any = {};
    
    // Process all fields except images
    formData.forEach((value, key) => {
      if (key !== 'images') {
        if (key === 'couleurs' || key === 'taille') {
          updates[key] = typeof value === 'string' ? value.split(',') : [];
        } else if (key === 'promotion') {
          updates[key] = value === 'true';
        } else if (key === 'price' || key === 'stock' || key === 'promoPrice' || 
                  key === 'rating' || key === 'reviewCount' || key === 'sold') {
          updates[key] = parseFloat(value as string);
        } else if (key === 'deliveryDate' && value) {
          updates[key] = new Date(value as string);
        } else {
          updates[key] = value;
        }
      }
    });

    await dbConnect();
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    return handleError(error, 'Failed to update product');
  }
}

// DELETE a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid product ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return handleError(error, 'Failed to delete product');
  }
}