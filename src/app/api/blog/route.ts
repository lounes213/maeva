import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import BlogPost from "@/app/models/blog";
import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from "@/lib/mongo";
import slugify from "@/lib/utils";
import toast from "react-hot-toast";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function for error responses
const errorResponse = (message: string, status: number = 500) => {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
};

// Amélioration des messages d'erreur avec des toasts spécifiques
export async function POST(req: NextRequest) {
  try {
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

    // Check if a blog post with the same slug already exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return errorResponse("A blog post with this title already exists", 400);
    }

    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    if (images.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/blog');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const image of images) {
        if (image.size > 5 * 1024 * 1024) continue;

        const buffer = await image.arrayBuffer();
        const ext = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        imageUrls.push(`/uploads/blog/${fileName}`);
      }
    }

    const blogPost = new BlogPost({
      title,
      content,
      slug,
      excerpt,
      category,
      tags,
      image: imageUrls[0] || undefined,
    });

    const savedPost = await blogPost.save();

    return NextResponse.json({
      success: true,
      data: savedPost,
      message: "Blog post created successfully"
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating blog post:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return errorResponse("A blog post with this title already exists", 400);
    }
    
    if (error.name === 'ValidationError') {
      return errorResponse(error.message, 400);
    }

    return errorResponse(error.message || "Failed to create blog post");
  }
}

// Amélioration des messages d'erreur avec des toasts spécifiques
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '10');
    const excludeSlug = searchParams.get('excludeSlug');

    if (slug) {
      const post = await BlogPost.findOne({ slug });
      if (!post) {
        return errorResponse("Blog post not found", 404);
      }
      return NextResponse.json({
        success: true,
        data: post
      });
    }

    let query = {};
    if (excludeSlug) {
      query = { slug: { $ne: excludeSlug } };
    }

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: posts
    });

  } catch (error: any) {
    console.error("Error fetching blog posts:", error);
    return errorResponse(error.message || "Failed to fetch blog posts");
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: "Le slug est requis" }, { status: 400 });
    }

    const existingPost = await BlogPost.findOne({ slug });
    if (!existingPost) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    const formData = await req.formData();
    const fields: any = {};

    // Traitement des champs textuels
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        fields[key] = value;
      }
    }

    // Traitement des tags s'ils sont présents
    if (fields.tags) {
      fields.tags = fields.tags.split(',').map((tag: string) => tag.trim());
    }

    // Génération du nouveau slug si le titre est modifié
    if (fields.title && !fields.slug) {
      fields.slug = slugify(fields.title);
    }

    // Traitement des images
    const images = formData.getAll('images') as File[];
    if (images.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/blog');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const image of images) {
        if (image.size > 5 * 1024 * 1024) continue;

        const buffer = await image.arrayBuffer();
        const ext = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        fields.image = `/uploads/blog/${fileName}`;

        if (existingPost.image && existingPost.image.startsWith('/uploads/')) {
          const oldImagePath = path.join(process.cwd(), 'public', existingPost.image);
          if (fs.existsSync(oldImagePath)) {
            await fs.promises.unlink(oldImagePath);
          }
        }
      }
    }

    const updatedPost = await BlogPost.findOneAndUpdate(
      { slug },
      fields,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour de l'article" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
    }

    const post = await BlogPost.findOne({ slug });
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Delete the database record
    await BlogPost.findOneAndDelete({ slug });

    // Only attempt to delete local image files if in development mode
    const isLocal = process.env.NODE_ENV === 'development';
    if (isLocal && post.image && post.image.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), 'public', post.image);
      if (fs.existsSync(imagePath)) {
        try {
          await fsp.unlink(imagePath);
        } catch (error) {
          console.error("Error deleting image file:", error);
        }
      }
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error: any) {
    console.error("Error in DELETE handler:", error);
    return NextResponse.json({ error: error.message || "Failed to delete blog post" }, { status: 500 });
  }
}