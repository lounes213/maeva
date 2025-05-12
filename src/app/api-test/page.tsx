'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async (endpoint: string) => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      });

      const data = await response.json();
      
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to test API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">API Test</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={() => testApi('test-upload')}
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Test /api/test-upload
          </button>
          
          <button
            onClick={() => testApi('direct-upload')}
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Test /api/direct-upload
          </button>
          
          <button
            onClick={() => testApi('cloudinary-upload')}
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Test /api/cloudinary-upload
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

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

        {testResult && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Test Result</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p><strong>Status:</strong> {testResult.status} {testResult.statusText}</p>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}