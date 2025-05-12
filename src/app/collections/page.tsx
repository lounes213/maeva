'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/header';
import Footer from '../components/footer';
import { ModernButton } from '@/components/ui/modern-button';

export default function CollectionsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const collections = [
    {
      id: 'summer-2023',
      title: 'Collection Été 2023',
      description: 'Des pièces légères et colorées pour la saison estivale',
      image: '/images/placeholder-collection.jpg',
      link: '/shop?collection=summer-2023'
    },
    {
      id: 'traditional',
      title: 'Collection Traditionnelle',
      description: 'L\'élégance de la tradition algérienne dans des coupes modernes',
      image: '/images/placeholder-collection.jpg',
      link: '/shop?collection=traditional'
    },
    {
      id: 'modern',
      title: 'Collection Moderne',
      description: 'Des designs contemporains inspirés par notre héritage',
      image: '/images/placeholder-collection.jpg',
      link: '/shop?collection=modern'
    }
  ];

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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((collection) => (
                  <div 
                    key={collection.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-64 w-full">
                      <Image
                        src={collection.image}
                        alt={collection.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.title}</h3>
                      <p className="text-gray-600 mb-4">{collection.description}</p>
                      <Link href={collection.link}>
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
        
        {/* Newsletter Section */}
        <section className="py-16 bg-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 font-serif mb-4">
              Restez informé
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Inscrivez-vous à notre newsletter pour être le premier à découvrir nos nouvelles collections
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-r-lg transition-colors">
                  S'inscrire
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}