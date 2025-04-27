import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Collection from '@/app/models/collection';
import { ObjectId } from 'mongodb';
import toast from 'react-hot-toast';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
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
    toast.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 