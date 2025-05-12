import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
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
    console.log('Received image upload request');
    
    // Get the request body
    const { dataUrl } = req.body;
    
    if (!dataUrl) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    try {
      // Upload to Cloudinary directly from data URL
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataUrl,
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
      
      return res.status(200).json({
        url: result.secure_url,
        success: true
      });
    } catch (uploadError) {
      console.error('Error uploading to Cloudinary:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
    }
  } catch (error) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload files' });
  }
}