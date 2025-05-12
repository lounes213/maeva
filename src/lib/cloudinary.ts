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

    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    }

    return data.secure_url;
  } catch (error) {
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
      // Continue with other files even if one fails
    }
  }
  
  return uploadedUrls;
};