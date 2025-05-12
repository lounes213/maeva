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

  // Define the type for artisans
  interface Artisan {
    id: number;
    name: string;
    specialty: string;
    location: string;
    image: string;
    description: string;
    products: string[];
  }

  const artisans: Artisan[] = [
    {
      id: 1,
      name: 'MAEVA Bouira',
      specialty: 'Artisanat traditionnel',
      location: 'Bouira, Algérie',
      image: '/images/image1.jpg',
      description: 'MAEVA Bouira est une marque spécialisée dans la création de vêtements traditionnels algériens. Nos artisans perpétuent un savoir-faire ancestral tout en apportant une touche de modernité à chaque pièce.',
      products: [
        '/uploads/products/c36697d5-7f89-4b56-9935-a14f2ea8bd8e.jpg', 
        '/uploads/products/c8236bbf-85ad-4378-985d-c383bc2818a6.jpg', 
        '/uploads/products/ca944a55-1a8a-4bce-a978-481ee0994054.jpg'
      ]
    },
    {
      id: 2,
      name: 'Atelier MAEVA',
      specialty: 'Couture traditionnelle',
      location: 'Bouira, Algérie',
      image: '/images/image2.jpg',
      description: 'Notre atelier de couture est le cœur de notre marque. C\'est ici que nos artisans talentueux créent des pièces uniques qui allient tradition et élégance contemporaine.',
      products: [
        '/uploads/products/d72ceb1e-8d0c-4e85-bf03-0f61d5b03c71.jpg', 
        '/uploads/products/df0c62fb-dbce-4b6c-9fb9-654885c55fea.jpg', 
        '/uploads/products/e64f9996-53dc-4ab7-80b2-39b66e8abea2.jpg'
      ]
    },
    {
      id: 3,
      name: 'Collection MAEVA',
      specialty: 'Design moderne',
      location: 'Bouira, Algérie',
      image: '/images/image3.jpg',
      description: 'Notre collection s\'inspire des motifs traditionnels algériens pour créer des vêtements modernes qui célèbrent notre riche héritage culturel tout en répondant aux tendances actuelles.',
      products: [
        '/uploads/products/2e14c4e6-57ff-4746-8300-7bc02f089a49.jpg', 
        '/uploads/products/38febedd-2240-4862-9b9b-a8bae63e27f4.jpg', 
        '/uploads/products/47e00d23-b51a-4d54-8098-dabc8323824b.jpg'
      ]
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
                          onError={(e) => {
                            // Fallback to a simple colored background if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.style.backgroundColor = '#FEF3C7'; // amber-100
                              const textElement = document.createElement('div');
                              textElement.className = 'absolute inset-0 flex items-center justify-center';
                              textElement.innerHTML = `<span class="text-amber-800 text-xl font-bold">${artisan.name.charAt(0)}</span>`;
                              parent.appendChild(textElement);
                            }
                          }}
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
                          <div key={i} className="relative h-24 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <Image
                              src={product}
                              alt={`Création de ${artisan.name}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                // Fallback to a simple colored background if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent infinite loop
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.style.backgroundColor = '#FEF3C7'; // amber-100
                                  const textElement = document.createElement('div');
                                  textElement.className = 'absolute inset-0 flex items-center justify-center';
                                  textElement.innerHTML = `<span class="text-amber-800 text-sm">Produit ${i+1}</span>`;
                                  parent.appendChild(textElement);
                                }
                              }}
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