import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongo';
import { Product } from '@/app/models/Product';

// Helper function to handle errors
const handleError = (error: any, defaultMessage: string) => {
  console.error(defaultMessage, error);
  
  // Handle validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    return NextResponse.json(
      { success: false, message: 'Validation failed', errors: validationErrors },
      { status: 400 }
    );
  }
  
  // Handle duplicate key error
  if (error.code === 11000) {
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

// GET all products with filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Build query from search params
    const category = searchParams.get('category');
    const promotion = searchParams.get('promotion');
    const name = searchParams.get('name');
    const reference = searchParams.get('reference');
    
    if (category) query.category = category;
    if (promotion) query.promotion = promotion === 'true';
    if (name) query.name = { $regex: name, $options: 'i' };
    if (reference) query.reference = { $regex: reference, $options: 'i' };

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
      .limit(limit);
    
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

// GET a single product by id
export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleError(error, 'Failed to fetch product');
  }
}

// CREATE a new product with image handling
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
        } else {
          body[key] = value;
        }
      }
    });

    await dbConnect();
    
    // Create new product
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

// UPDATE a product with partial updates
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const updates: any = {};
    
    // Process all fields except images
    formData.forEach((value, key) => {
      if (key !== 'images') {
        // Handle arrays and boolean values
        if (key === 'couleurs' || key === 'taille') {
          updates[key] = typeof value === 'string' ? value.split(',') : [];
        } else if (key === 'promotion') {
          updates[key] = value === 'true';
        } else if (key === 'price' || key === 'stock' || key === 'promoPrice' || 
                  key === 'rating' || key === 'reviewCount' || key === 'sold') {
          updates[key] = parseFloat(value as string);
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
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
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
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    return handleError(error, 'Failed to delete product');
  }
}