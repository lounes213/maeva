// File: src/app/api/blog/route.ts
// Next.js App Router API implementation

import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Type for our response
type BlogApiResponse = {
  success: boolean;
  message: string;
  error: boolean;
  data: any;
};

// In App Router, we define separate handler functions for each HTTP method
export async function GET(request: NextRequest) {
  console.log('Received GET request to /api/blog');

  try {
    // Parse URL and searchParams
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    // If slug is provided, return a single blog post
    if (slug) {
      // Here you would fetch the blog post from your database
      const post = {}; // Replace with actual database query
      
      return NextResponse.json({
        success: true,
        message: 'Blog post retrieved successfully',
        error: false,
        data: post
      }, { status: 200 });
    }

    // Handle listing blog posts with pagination and filters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Here you would query your database with these parameters
    const posts: never[] = []; // Replace with actual database query
    const total = 0; // Replace with count from database

    return NextResponse.json({
      success: true,
      message: 'Blog posts retrieved successfully',
      error: false,
      data: {
        posts,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error in GET /api/blog:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal Server Error',
      error: true,
      data: null
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/blog');

  try {
    // In App Router, we need to handle file uploads differently
    // Since we can't use formidable directly with the Request stream
    
    // For multipart form data, we need to:
    // 1. Get the FormData from the request
    const formData = await request.formData();
    
    // 2. Process the form data
    const blogPostData: any = {};
    const uploadedImages: string[] = [];
    
    // Process text fields
    for (const [key, value] of formData.entries()) {
      // Handle files separately
      if (value instanceof File) {
        if (key === 'images' || key.startsWith('images[')) {
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Create uploads directory if it doesn't exist
          const uploadsDir = join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          // Generate unique filename
          const fileName = `${uuidv4()}-${value.name.replace(/\s/g, '-')}`;
          const filePath = join(uploadsDir, fileName);
          
          // Write the file
          await writeFile(filePath, buffer);
          
          // Store the public URL
          const publicPath = `/uploads/${fileName}`;
          uploadedImages.push(publicPath);
        }
      } else if (key === 'tags') {
        // Process tags into an array
        blogPostData.tags = String(value).split(',').map(tag => tag.trim());
      } else {
        // Add other fields directly
        blogPostData[key] = value;
      }
    }
    
    // Add images to the blog post data
    if (uploadedImages.length > 0) {
      blogPostData.images = uploadedImages;
      blogPostData.image = uploadedImages[0]; // Set first image as main image
    }
    
    // Add creation timestamps
    blogPostData.createdAt = new Date().toISOString();
    blogPostData.updatedAt = new Date().toISOString();
    
    // Here you would save to your database
    // const savedPost = await db.blogPosts.create(blogPostData);
    
    // For now, just return the processed data
    const savedPost = {
      _id: uuidv4(),
      ...blogPostData
    };

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      error: false,
      data: savedPost
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error in POST /api/blog:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal Server Error',
      error: true,
      data: null
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  console.log('Received PUT request to /api/blog');

  try {
    // Get the slug from the query parameters
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Slug is required',
        error: true,
        data: null
      }, { status: 400 });
    }
    
    // Process the form data similarly to POST
    const formData = await request.formData();
    
    // Process the form data
    const blogPostData: any = {};
    const uploadedImages: string[] = [];
    
    // Process text fields
    for (const [key, value] of formData.entries()) {
      // Handle files separately
      if (value instanceof File) {
        if (key === 'images' || key.startsWith('images[')) {
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Create uploads directory if it doesn't exist
          const uploadsDir = join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          // Generate unique filename
          const fileName = `${uuidv4()}-${value.name.replace(/\s/g, '-')}`;
          const filePath = join(uploadsDir, fileName);
          
          // Write the file
          await writeFile(filePath, buffer);
          
          // Store the public URL
          const publicPath = `/uploads/${fileName}`;
          uploadedImages.push(publicPath);
        }
      } else if (key === 'tags') {
        // Process tags into an array
        blogPostData.tags = String(value).split(',').map(tag => tag.trim());
      } else {
        // Add other fields directly
        blogPostData[key] = value;
      }
    }
    
    // Add images to the blog post data
    if (uploadedImages.length > 0) {
      blogPostData.images = uploadedImages;
      // Only set main image if not already set
      if (!blogPostData.image && uploadedImages.length > 0) {
        blogPostData.image = uploadedImages[0];
      }
    }
    
    // Update the timestamp
    blogPostData.updatedAt = new Date().toISOString();
    
    // Here you would update your database record
    // const updatedPost = await db.blogPosts.findOneAndUpdate({ slug }, blogPostData, { new: true });
    
    // For now, just return the processed data
    const updatedPost = {
      _id: uuidv4(),
      slug,
      ...blogPostData
    };

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      error: false,
      data: updatedPost
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error in PUT /api/blog:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal Server Error',
      error: true,
      data: null
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  console.log('Received DELETE request to /api/blog');

  try {
    // Get the slug from the query parameters
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Slug is required',
        error: true,
        data: null
      }, { status: 400 });
    }
    
    // Here you would delete the blog post from your database
    // await db.blogPosts.deleteOne({ slug });
    
    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
      error: false,
      data: null
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error in DELETE /api/blog:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal Server Error',
      error: true,
      data: null
    }, { status: 500 });
  }
}

// Optional: Define OPTIONS handler to support CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}