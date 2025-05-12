import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import slugify from "@/lib/utils";
import BlogPost from "@/app/models/blog";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Parse JSON body instead of formData
    const data = await req.json();
    const { title, content, slug, excerpt, category, tags, imageUrls } = data;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const blogPost = new BlogPost({
      title,
      content,
      slug: slug || slugify(title),
      excerpt,
      category,
      tags: Array.isArray(tags) ? tags : tags?.split(",").map((t: string) => t.trim()) || [],
      image: imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined,
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

    // Parse JSON body
    const data = await req.json();
    const { title, content, excerpt, category, tags, imageUrls } = data;
    
    const update: any = {
      title,
      content,
      excerpt,
      category
    };

    if (tags) {
      update.tags = Array.isArray(tags) ? tags : tags.split(",").map((tag: string) => tag.trim());
    }

    if (title && !data.slug) {
      update.slug = slugify(title);
    } else if (data.slug) {
      update.slug = data.slug;
    }

    // Update image if new images were uploaded
    if (imageUrls && imageUrls.length > 0) {
      update.image = imageUrls[0];
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

    // No need to delete images from Cloudinary as they are managed separately
    
    return NextResponse.json({ message: "Blog post deleted successfully" });

  } catch (err: any) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete blog post" }, { status: 500 });
  }
}
