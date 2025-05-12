import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import { MAX_FILE_SIZE } from '@/lib/constant';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received upload request in Pages API route');
    
    // Parse the form data
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      multiples: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });

    const fileArray = files.files || [];
    const filesArray = Array.isArray(fileArray) ? fileArray : [fileArray];
    
    console.log(`Found ${filesArray.length} files in the request`);

    if (filesArray.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedUrls: string[] = [];

    for (const file of filesArray) {
      // Validate file type
      const fileType = file.mimetype || '';
      if (!fileType.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }

      try {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            file.filepath,
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
        return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
      }
    }

    return res.status(200).json(uploadedUrls);
  } catch (error: any) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload files' });
  }
}