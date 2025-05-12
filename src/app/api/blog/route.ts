import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/mongo";
import slugify from "@/lib/utils";
import BlogPost from "@/app/models/blog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const uploadDir = path.join(process.cwd(), "public/uploads/blog");

async function saveImage(file: File): Promise<string | null> {
  if (file.size > MAX_FILE_SIZE) return null;

  const buffer = await file.arrayBuffer();
  const ext = path.extname(file.name);
  const fileName = `${uuidv4()}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  await fs.writeFile(filePath, Buffer.from(buffer));
  return `/uploads/blog/${fileName}`;
}

async function deleteImageIfExists(imagePath: string) {
  try {
    const fullPath = path.join(process.cwd(), "public", imagePath);
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }
  } catch (err) {
    console.error("Error deleting image:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const slug = (formData.get("slug") as string) || slugify(title);
    const excerpt = formData.get("excerpt") as string;
    const category = formData.get("category") as string;
    const tags = formData.get("tags")?.toString().split(",").map(t => t.trim()) || [];

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const images = formData.getAll("images") as File[];
    const imageUrls: string[] = [];

    for (const image of images) {
      const imageUrl = await saveImage(image);
      if (imageUrl) imageUrls.push(imageUrl);
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

  } catch (err: any) {
    console.error("POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create blog post" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const post = await BlogPost.findOne({ slug });
      if (!post) return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
      return NextResponse.json(post);
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    const query: any = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const total = await BlogPost.countDocuments(query);

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (err: any) {
    console.error("GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch posts" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

    const post = await BlogPost.findOne({ slug });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const formData = await req.formData();
    const update: any = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        update[key] = value;
      }
    }

    if (update.tags) {
      update.tags = update.tags.split(",").map((tag: string) => tag.trim());
    }

    if (update.title && !update.slug) {
      update.slug = slugify(update.title);
    }

    const images = formData.getAll("images") as File[];
    for (const image of images) {
      const imageUrl = await saveImage(image);
      if (imageUrl) {
        if (post.image && post.image.startsWith("/uploads/")) {
          await deleteImageIfExists(post.image);
        }
        update.image = imageUrl;
      }
    }

    const updated = await BlogPost.findOneAndUpdate({ slug }, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updated);

  } catch (err: any) {
    console.error("PUT Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

    const post = await BlogPost.findOneAndDelete({ slug });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const isLocal = process.env.NODE_ENV === "development";
    if (isLocal && post.image?.startsWith("/uploads/")) {
      await deleteImageIfExists(post.image);
    }

    return NextResponse.json({ message: "Blog post deleted successfully" });

  } catch (err: any) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete blog post" }, { status: 500 });
  }
}
