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

// Amélioration des messages d'erreur avec des toasts spécifiques
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const slug = (formData.get('slug') as string) || slugify(title);
      const excerpt = formData.get('excerpt') as string;
      const category = formData.get('category') as string;
      const tags = formData.get('tags')?.toString().split(',').map(t => t.trim()) || [];

      if (!title || !content) {
        toast.error("Le titre et le contenu sont obligatoires.");
        return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
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

      return NextResponse.json(savedPost, { status: 201 });
    }

    toast.error("Type de contenu non pris en charge.");
    return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 415 });
  } catch (error: any) {
    toast.error("Erreur lors de la création de l'article de blog.");
    return NextResponse.json({ error: error.message || "Failed to create blog post" }, { status: 500 });
  }
}

// Amélioration des messages d'erreur avec des toasts spécifiques
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const post = await BlogPost.findOne({ slug });
      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
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

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get blog posts" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    // Récupération du slug depuis l'URL
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: "Le slug est requis" }, { status: 400 });
    }

    // Vérification de l'existence de l'article
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
      
      // Création du dossier d'upload si nécessaire
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const image of images) {
        // Limite de taille à 5MB
        if (image.size > 5 * 1024 * 1024) continue;

        const buffer = await image.arrayBuffer();
        const ext = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        // Sauvegarde de l'image
        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        fields.image = `/uploads/blog/${fileName}`;

        // Suppression de l'ancienne image si elle existe
        if (existingPost.image && existingPost.image.startsWith('/uploads/')) {
          const oldImagePath = path.join(process.cwd(), 'public', existingPost.image);
          if (fs.existsSync(oldImagePath)) {
            await fs.promises.unlink(oldImagePath);
          }
        }
      }
    }

    // Mise à jour de l'article
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
    console.error("Erreur lors de la mise à jour:", error);
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

    await BlogPost.findOneAndDelete({ slug });

    if (post.image && post.image.startsWith('/uploads/')) {
      try {
        const imagePath = path.join(process.cwd(), 'public', post.image);
        if (fs.existsSync(imagePath)) {
          await fsp.unlink(imagePath);
        }
      } catch (error) {
        toast.error("Error deleting image file:");
      }
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete blog post" }, { status: 500 });
  }
}
