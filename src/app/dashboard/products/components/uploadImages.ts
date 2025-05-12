/**
 * Helper function to upload images to Cloudinary
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    console.log(`Uploading ${files.length} images to Cloudinary...`);
    
    const uploadFormData = new FormData();
    files.forEach(file => {
      uploadFormData.append('files', file);
    });

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload response error:', uploadResponse.status, errorText);
      throw new Error(`Failed to upload images: ${uploadResponse.status} ${errorText}`);
    }

    const uploadedUrls = await uploadResponse.json();
    console.log('Successfully uploaded images:', uploadedUrls);
    return uploadedUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}