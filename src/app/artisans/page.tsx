'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import { ModernButton } from '@/components/ui/modern-button';

export default function ArtisansPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const artisans = [
    {
      id: 1,
      name: 'Amina Benali',
      specialty: 'Broderie traditionnelle',
      location: 'Alger',
      image: '/images/placeholder-artisan.jpg',
      description: 'Spécialisée dans la broderie traditionnelle algérienne depuis plus de 20 ans, Amina crée des pièces uniques qui allient tradition et modernité.',
      products: ['/images/placeholder-product.jpg', '/images/placeholder-product.jpg', '/images/placeholder-product.jpg']
    },
    {
      id: 2,
      name: 'Karim Hadj',
      specialty: 'Tissage',
      location: 'Constantine',
      image: '/images/placeholder-artisan.jpg',
      description: 'Maître tisserand, Karim perpétue un savoir-faire familial transmis de génération en génération. Ses créations sont reconnues pour leur qualité exceptionnelle.',
      products: ['/images/placeholder-product.jpg', '/images/placeholder-product.jpg', '/images/placeholder-product.jpg']
    },
    {
      id: 3,
      name: 'Nadia Messaoudi',
      specialty: 'Couture moderne',
      location: 'Oran',
      image: '/images/placeholder-artisan.jpg',
      description: 'Designer de mode contemporaine, Nadia s\'inspire des motifs traditionnels pour créer des vêtements modernes qui célèbrent l\'héritage algérien.',
      products: ['/images/placeholder-product.jpg', '/images/placeholder-product.jpg', '/images/placeholder-product.jpg']
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
              Nos Artisans
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les artisans talentueux qui créent nos collections avec passion et savoir-faire
            </p>
            <div className="w-24 h-1 bg-amber-600 mx-auto mt-6 mb-8"></div>
          </div>
        </section>
        
        {/* Artisans Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <div className="space-y-16">
                {artisans.map((artisan, index) => (
                  <div 
                    key={artisan.id}
                    className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
                  >
                    <div className="w-full lg:w-1/3">
                      <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-md">
                        <Image
                          src={artisan.image}
                          alt={artisan.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="w-full lg:w-2/3">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{artisan.name}</h2>
                      <p className="text-amber-600 font-medium mb-1">{artisan.specialty}</p>
                      <div className="flex items-center text-gray-500 mb-4">
                        <MapPin size={16} className="mr-1" />
                        <span>{artisan.location}</span>
                      </div>
                      <p className="text-gray-600 mb-6">{artisan.description}</p>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Créations</h3>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {artisan.products.map((product, i) => (
                          <div key={i} className="relative h-24 rounded-md overflow-hidden">
                            <Image
                              src={product}
                              alt={`Création de ${artisan.name}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <Link href={`/shop?artisan=${artisan.id}`}>
                        <ModernButton variant="primary">
                          Voir toutes les créations
                        </ModernButton>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Become an Artisan Section */}
        <section className="py-16 bg-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 font-serif mb-4">
                  Rejoignez notre communauté d'artisans
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Vous êtes un artisan talentueux ? Partagez votre savoir-faire avec notre communauté et faites découvrir vos créations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-amber-50 p-6 rounded-lg text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-amber-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Contactez-nous</h3>
                  <p className="text-gray-600 text-sm">Envoyez-nous un message avec des photos de vos créations</p>
                </div>
                
                <div className="bg-amber-50 p-6 rounded-lg text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-amber-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Entretien</h3>
                  <p className="text-gray-600 text-sm">Nous organisons une rencontre pour discuter de votre travail</p>
                </div>
                
                <div className="bg-amber-50 p-6 rounded-lg text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-amber-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Collaboration</h3>
                  <p className="text-gray-600 text-sm">Nous définissons ensemble les termes de notre collaboration</p>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/contact?subject=Devenir%20Artisan">
                  <ModernButton variant="primary" size="lg">
                    Nous contacter
                  </ModernButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}