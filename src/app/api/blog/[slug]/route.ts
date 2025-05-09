import BlogPost from '@/app/models/blog';
import dbConnect from '@/lib/mongo';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const post = await BlogPost.findById(params.id);
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching blog post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const body = await req.json();
    const updatedPost = await BlogPost.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating blog post' }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    await BlogPost.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting blog post' }, { status: 500 });
  }
}
