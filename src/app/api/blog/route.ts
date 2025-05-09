// app/api/blog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import BlogPost from '@/app/models/blog';
import dbConnect from '@/lib/mongo';
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), '/public/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filename: (_, file) => `${Date.now()}_${file.originalFilename}`,
  });

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { fields, files } = await parseForm(req);
    const imagePath = files.image?.[0]?.newFilename;

    const newBlog = await BlogPost.create({
      ...fields,
      tags: JSON.parse(fields.tags || '[]'),
      image: imagePath ? [`/uploads/${imagePath}`] : [],
    });

    return NextResponse.json({ success: true, blog: newBlog });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
