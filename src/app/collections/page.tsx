'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/header';
import Footer from '../components/footer';
import { ModernButton } from '@/components/ui/modern-button';

interface Collection {
  _id: string;
  name: string;
  description?: string;
  image?: string[];
  tags?: string[];
  isFeatured?: boolean;
  slug?: string;
}

export default function CollectionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/collection');
        
        if (!res.ok) {
          throw new Error('Failed to fetch collections');
        }
        
        const data = await res.json();
        setCollections(data.data || []);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Une erreur est survenue lors du chargement des collections. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-4">
              Nos Collections
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos collections exclusives de vêtements algériens, alliant tradition et modernité
            </p>
            <div className="w-24 h-1 bg-amber-600 mx-auto mt-6 mb-8"></div>
          </div>
        </section>
        
        {/* Collections Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Aucune collection n'est disponible pour le moment.</p>
                <Link href="/shop">
                  <ModernButton variant="primary">
                    Voir tous nos produits
                  </ModernButton>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((collection) => (
                  <div 
                    key={collection._id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-64 w-full">
                      {collection.image && collection.image.length > 0 ? (
                        <Image
                          src={collection.image[0]}
                          alt={collection.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback to a simple colored background if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-600 font-bold text-xl">{collection.name.charAt(0)}</span>
                        </div>
                      )}
                      {collection.isFeatured && (
                        <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                          Populaire
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.name}</h3>
                      <p className="text-gray-600 mb-4">{collection.description || "Découvrez notre collection exclusive de vêtements traditionnels algériens."}</p>
                      {collection.tags && collection.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {collection.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link href={`/collection/${collection._id}`}>
                        <ModernButton variant="primary" className="w-full">
                          Découvrir
                        </ModernButton>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        

      </main>
      
      <Footer />
    </div>
  );
}