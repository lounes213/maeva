import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/app/models/Product';

export async function GET() {
  try {
    await connectDB();

    // Get all unique categories from products
    const products = await Product.find({}, 'category');
    const categories = Array.from(new Set(products.map((p: { category: string }) => p.category))).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingProducts = await Product.find({ category: name });
    if (existingProducts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Category already exists' },
        { status: 400 }
      );
    }

    // Create a new product with this category to ensure it's available
    await Product.create({
      name: 'Temporary Product',
      reference: 'TEMP-' + Date.now(),
      description: 'Temporary product for category creation',
      price: 0,
      stock: 0,
      category: name,
      imageUrls: []
    });

    return NextResponse.json({
      success: true,
      message: 'Category added successfully'
    });
  } catch (error: any) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add category' },
      { status: 500 }
    );
  }
} 