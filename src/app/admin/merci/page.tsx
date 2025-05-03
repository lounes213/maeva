'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MerciPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers la page d'accueil après 5 secondes
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white px-4">
      <div className="text-center max-w-md mx-auto">
        <img src="/logo.png" alt="Logo Maiva" className="w-24 h-24 mx-auto mb-8 rounded-full shadow-lg" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Merci de votre visite !
        </h1>
        
        <p className="text-gray-600 mb-8">
          Vous avez été déconnecté avec succès. Vous serez redirigé vers la page d'accueil dans quelques secondes.
        </p>

        <div className="space-y-4">
          <Link 
            href="/admin/login"
            className="inline-block w-full px-6 py-3 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors duration-200"
          >
            Se reconnecter
          </Link>
          
          <Link 
            href="/"
            className="inline-block w-full px-6 py-3 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-200"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}