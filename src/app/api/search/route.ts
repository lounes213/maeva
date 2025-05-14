import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import { Product } from '@/app/models/Product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ 
        success: true, 
        products: [],
        data: [], // Include data for backward compatibility
        message: 'No search query provided'
      });
    }

    await dbConnect();
    
    // Create search terms from the query
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    
    // Build the search query
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { 'categories.name': { $regex: query, $options: 'i' } }
      ]
    };
    
    // Execute the search
    const products = await Product.find(searchQuery).limit(50);
    
    return NextResponse.json({ 
      success: true, 
      products,
      data: products, // Include data for backward compatibility
      count: products.length,
      query
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error processing search request' },
      { status: 500 }
    );
  }
}