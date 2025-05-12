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

    // Use the Pages Router API endpoint instead of App Router
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
      headers: {
        // Don't set Content-Type header when sending FormData
        // The browser will automatically set the correct multipart/form-data with boundary
      }
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload response error:', uploadResponse.status, errorText);
      
      if (uploadResponse.status === 405) {
        throw new Error(`Method Not Allowed: The server does not support the POST method for this endpoint. Please check the API route configuration.`);
      } else {
        throw new Error(`Failed to upload images: ${uploadResponse.status} ${errorText}`);
      }
    }

    const uploadedUrls = await uploadResponse.json();
    console.log('Successfully uploaded images:', uploadedUrls);
    return uploadedUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}