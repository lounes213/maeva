import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import BlogPost from "@/app/models/blog";

export async function PUT(req: NextRequest, context: { params: { slug: string } }) {
  try {
    await dbConnect();
    const slug = context.params.slug;
    if (!slug) {
      return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
    }
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 415 });
    }
    const body = await req.json();
    const updatedPost = await BlogPost.findOneAndUpdate(
      { slug },
      body,
      { new: true, runValidators: true }
    );
    if (!updatedPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    return NextResponse.json(updatedPost);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update blog post" }, { status: 500 });
  }
}
