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