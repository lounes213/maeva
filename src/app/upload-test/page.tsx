'use client';

import { useState } from 'react';
import { directUploadImages } from '../dashboard/products/components/directUpload';

export default function UploadTestPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const urls = await directUploadImages(selectedFiles);
      setUploadedUrls(urls);
      setSelectedFiles([]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Test</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          <div className="mt-2 text-sm text-gray-500">
            {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'No files selected'}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isUploading || selectedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {uploadedUrls.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Uploaded Images</h2>
            <div className="grid grid-cols-2 gap-4">
              {uploadedUrls.map((url, index) => (
                <div key={index} className="border rounded-md overflow-hidden">
                  <img src={url} alt={`Uploaded ${index + 1}`} className="w-full h-32 object-cover" />
                  <div className="p-2 bg-gray-50 break-all text-xs">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                      {url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}