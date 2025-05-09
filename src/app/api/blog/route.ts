import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import BlogPost from "@/app/models/blog";
import { v4 as uuidv4 } from 'uuid';
import dbConnect from "@/lib/mongo";
import slugify from "@/lib/utils";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary - FIXED CONFIGURATION
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

// Helper function for error responses
const errorResponse = (message: string, status: number = 500) => {
  return NextResponse.json(
    { 
      success: false, 
      message,
      error: true,
      data: null
    },
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
};

// Helper function for success responses
const successResponse = (data: any, message: string = "Success", status: number = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      error: false,
      data
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
};

// FIXED: Improved error handling and added try-catch for Cloudinary operations
async function handleImageUpload(image: File): Promise<string | undefined> {
  try {
    // Validate cloudinary config first
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary configuration');
      throw new Error('Cloudinary configuration is missing');
    }

    // Check image size
    if (image.size > 5 * 1024 * 1024) {
      console.warn(`Image too large: ${image.name}`);
      throw new Error('Image size exceeds 5MB limit');
    }

    // Convert to base64
    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const dataURI = `data:${image.type};base64,${base64Image}`;

    // Upload to Cloudinary with proper promise handling
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI, 
        {
          folder: 'blog',
          resource_type: 'auto',
        }, 
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error(`Error uploading image ${image.name}:`, error);
    // Don't throw here, just return undefined so we can continue
    return undefined;
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    await dbConnect();

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return errorResponse("Content-Type must be multipart/form-data", 415);
    }

    const formData = await req.formData();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const slug = (formData.get('slug') as string) || slugify(title);
    const excerpt = formData.get('excerpt') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags')?.toString().split(',').map(t => t.trim()) || [];

    if (!title || !content) {
      return errorResponse("Title and content are required", 400);
    }

    // Check if a post with this slug already exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return errorResponse("A post with this title already exists", 409);
    }

    let imageUrl;
    try {
      // Process only the first image for featured image
      const images = formData.getAll('images') as File[];
      if (images.length > 0) {
        imageUrl = await handleImageUpload(images[0]);
      }
    } catch (imageError: any) {
      // Log but continue without image if upload fails
      console.error('Image upload failed:', imageError);
      // We'll continue without the image
    }

    const blogPost = new BlogPost({
      title,
      content,
      slug,
      excerpt,
      category,
      tags,
      image: imageUrl,
    });

    const savedPost = await blogPost.save();

    return successResponse(savedPost, "Blog post created successfully", 201);

  } catch (error: any) {
    console.error("Error creating blog post:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return errorResponse("A post with this title already exists", 409);
    }
    
    if (error.name === 'ValidationError') {
      return errorResponse(error.message, 400);
    }

    return errorResponse(error.message || "Failed to create blog post");
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const post = await BlogPost.findOne({ slug });
      if (!post) {
        return errorResponse('Blog post not found', 404);
      }
      return successResponse(post);
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    const query: any = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    return successResponse({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching blog posts:", error);
    return errorResponse(error.message || "Failed to get blog posts");
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return errorResponse("Slug is required", 400);
    }

    const existingPost = await BlogPost.findOne({ slug });
    if (!existingPost) {
      return errorResponse("Blog post not found", 404);
    }

    const formData = await req.formData();
    const fields: any = {};

    // Process text fields
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        fields[key] = value;
      }
    }

    // Process tags if present
    if (fields.tags) {
      fields.tags = fields.tags.split(',').map((tag: string) => tag.trim());
    }

    // Generate new slug if title is modified
    if (fields.title && !fields.slug) {
      fields.slug = slugify(fields.title);
    }

    // Process images - FIXED: better error handling
    try {
      const images = formData.getAll('images') as File[];
      if (images.length > 0) {
        const imageUrl = await handleImageUpload(images[0]);
        if (imageUrl) {
          fields.image = imageUrl;
        }
      }
    } catch (imageError) {
      console.error('Error processing image - continuing without updating image:', imageError);
      // Continue without updating the image
    }

    const updatedPost = await BlogPost.findOneAndUpdate(
      { slug },
      fields,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return errorResponse("Failed to update blog post", 500);
    }

    return successResponse(updatedPost, "Blog post updated successfully");
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return errorResponse(error.message || "Failed to update blog post");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return errorResponse("Slug parameter is required", 400);
    }

    const post = await BlogPost.findOne({ slug });
    if (!post) {
      return errorResponse('Blog post not found', 404);
    }

    await BlogPost.findOneAndDelete({ slug });

    return successResponse(null, 'Blog post deleted successfully');
  } catch (error: any) {
    console.error("Error in DELETE handler:", error);
    return errorResponse(error.message || "Failed to delete blog post");
  }
}