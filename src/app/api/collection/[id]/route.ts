import { NextResponse } from 'next/server';
import {dbConnect} from '@/lib/mongo';
import Collection from '@/app/models/collection';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // Get last part of the path

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid or missing collection ID' },
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
