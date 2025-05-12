'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store'
        });

        console.log('Auth response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auth data:', data);
          setUserData(data);
          setAuthStatus('authenticated');
        } else {
          const errorData = await response.json();
          console.error('Auth error:', errorData);
          setError(errorData.message || 'Authentication failed');
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to check authentication status');
        setAuthStatus('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        {authStatus === 'authenticated' ? (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-green-700 font-medium">You are authenticated!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium">You are not authenticated</p>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
          </div>
        )}

        {userData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">User Information</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>ID:</strong> {userData._id}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Created:</strong> {new Date(userData.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link href="/admin/login" className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded hover:bg-indigo-700">
            Go to Login Page
          </Link>
          
          <Link href="/dashboard" className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded hover:bg-green-700">
            Go to Dashboard
          </Link>
          
          <button 
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.reload();
              } catch (err) {
                console.error('Logout error:', err);
              }
            }}
            className="block w-full bg-red-600 text-white text-center py-2 px-4 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}