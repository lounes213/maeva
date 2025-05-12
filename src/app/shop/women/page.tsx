'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/header';
import Footer from '../../components/footer';

export default function WomenShopPage() {
  const router = useRouter();

  // Redirect to main shop page with category filter
  useEffect(() => {
    router.push('/shop?category=women');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Catégorie Femmes</h1>
          <p className="text-gray-600 mb-4">Redirection vers la boutique...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}