import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { MAX_FILE_SIZE } from '@/lib/constant';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This is the correct way to configure the route for Next.js App Router
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set maximum duration for the API route (in seconds)

// Add OPTIONS method to handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  // Add CORS headers to the response
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    console.log('Received upload request at /api/cloudinary-upload');
    const formData = await request.formData();
    console.log('FormData received');
    const files = formData.getAll('files') as File[];
    console.log(`Found ${files.length} files in the request`);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400, headers }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
          { status: 400, headers }
        );
      }

      // Validate file type
      const fileType = file.type;
      if (!fileType.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Only image files are allowed' },
          { status: 400, headers }
        );
      }

      try {
        // Convert file to base64 string for Cloudinary upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            base64String,
            {
              folder: 'maiva-shop/products',
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

        // Add the secure URL from Cloudinary to our response
        uploadedUrls.push((result as any).secure_url);
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image to Cloudinary' },
          { status: 500, headers }
        );
      }
    }

    return NextResponse.json(uploadedUrls, { headers });
  } catch (error: any) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload files' },
      { status: 500, headers }
    );
  }
}