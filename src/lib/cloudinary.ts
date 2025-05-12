// Hardcoded fallback values in case environment variables are not available
const CLOUDINARY_DEFAULTS = {
  UPLOAD_PRESET: 'maiva_uploads',
  CLOUD_NAME: 'dxnvewivi'
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // Check if file is valid
    if (!file || !(file instanceof File) || file.size === 0) {
      throw new Error('Invalid file object');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Use environment variables with fallbacks
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_DEFAULTS.UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || CLOUDINARY_DEFAULTS.CLOUD_NAME;

    console.log('Using Cloudinary config:', { uploadPreset, cloudName });

    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);

    console.log(`Uploading file ${file.name} (${file.size} bytes) to Cloudinary...`);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary upload error:', data);
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    }

    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (const file of files) {
    try {
      const url = await uploadToCloudinary(file);
      uploadedUrls.push(url);
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      // Continue with other files even if one fails
    }
  }
  
  return uploadedUrls;
};