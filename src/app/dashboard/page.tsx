'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClient from '../verify/DashboardClient';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Important: include cookies in the request
          cache: 'no-store' // Prevent caching
        });
        console.log('Auth check response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Auth check failed:', errorData);
          setAuthError(errorData.message || 'Non authentifié');
          throw new Error(errorData.message || 'Non authentifié');
        }
        
        const userData = await response.json();
        console.log('User data received:', userData);
        
        if (!userData || !userData._id) {
          console.error('Invalid user data received');
          setAuthError('Données utilisateur invalides');
          throw new Error('Invalid user data');
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Authentication error:', error);
        // Don't redirect automatically, show the error message instead
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">
            {authError || "Vous n'êtes pas connecté ou votre session a expiré."}
          </p>
          <button
            onClick={() => router.push('/admin/login')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return <DashboardClient user={user} />;
}
