/**
 * Helper function to upload images using the Pages Router API
 */
export async function pagesUploadImages(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    console.log(`Uploading ${files.length} images using Pages Router API...`);
    
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      // Convert file to data URL
      const dataUrl = await fileToDataUrl(file);
      
      // Upload to Cloudinary via our Pages Router API
      const uploadResponse = await fetch('/api/image-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataUrl }),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload response error:', uploadResponse.status, errorText);
        throw new Error(`Failed to upload image: ${uploadResponse.status} ${errorText}`);
      }

      const data = await uploadResponse.json();
      if (data.url) {
        uploadedUrls.push(data.url);
      }
    }
    
    console.log('Successfully uploaded images:', uploadedUrls);
    return uploadedUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}

/**
 * Convert a File object to a data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}