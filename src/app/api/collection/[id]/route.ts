import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Collection from '@/app/models/collection';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // <- params is a Promise
) {
  const { params } = context;
  const { id } = await params;  // <- await here!!

  try {
    await dbConnect();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid collection ID format' },
        { status: 400 }
      );
    }

    const collection = await Collection.findById(new ObjectId(id));
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(collection.toObject());
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
