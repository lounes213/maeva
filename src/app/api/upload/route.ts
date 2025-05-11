import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { MAX_FILE_SIZE } from '@/lib/constant';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/products');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
          { status: 400 }
        );
      }

      // Validate file type
      const fileType = file.type;
      if (!fileType.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Only image files are allowed' },
          { status: 400 }
        );
      }

      // Generate unique filename
      const buffer = await file.arrayBuffer();
      const ext = path.extname(file.name) || '.jpg'; // Default to .jpg if extension is missing
      const filename = `${uuidv4()}${ext}`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      await fs.writeFile(filepath, Buffer.from(buffer));
      
      // Add URL to response
      uploadedUrls.push(`/uploads/products/${filename}`);
    }

    return NextResponse.json(uploadedUrls);
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}