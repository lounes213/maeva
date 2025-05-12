// Script to set up Cloudinary upload preset
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_PRESET_NAME = 'maiva_uploads';

async function setupCloudinary() {
  try {
    console.log('Checking for existing upload presets...');
    
    // List all upload presets
    const { presets } = await cloudinary.api.upload_presets();
    
    // Check if our preset already exists
    const existingPreset = presets.find(preset => preset.name === UPLOAD_PRESET_NAME);
    
    if (existingPreset) {
      console.log(`Upload preset '${UPLOAD_PRESET_NAME}' already exists.`);
      
      // Update the preset to ensure it's configured correctly
      await cloudinary.api.update_upload_preset(UPLOAD_PRESET_NAME, {
        unsigned: true,
        folder: 'maiva_products',
        allowed_formats: 'jpg,jpeg,png,gif',
        transformation: [
          { width: 1000, crop: 'limit' }
        ]
      });
      
      console.log(`Updated upload preset '${UPLOAD_PRESET_NAME}'.`);
    } else {
      // Create a new upload preset
      await cloudinary.api.create_upload_preset({
        name: UPLOAD_PRESET_NAME,
        unsigned: true,
        folder: 'maiva_products',
        allowed_formats: 'jpg,jpeg,png,gif',
        transformation: [
          { width: 1000, crop: 'limit' }
        ]
      });
      
      console.log(`Created new upload preset '${UPLOAD_PRESET_NAME}'.`);
    }
    
    console.log('Cloudinary setup completed successfully!');
  } catch (error) {
    console.error('Error setting up Cloudinary:', error);
  }
}

setupCloudinary();