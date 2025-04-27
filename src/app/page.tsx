// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { FiShoppingBag, FiStar, FiTruck, FiRefreshCw, FiShield, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from './components/header';
import Footer from './components/footer';

import BlogGrid from './components/blogGrid';
import CollectionGrid from './collection/components/collectionGrid';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tissu?: string;
  couleurs?: string[];
  taille?: string[];
  promotion?: boolean;
  promoPrice?: number;
  imageUrls?: string[];
  sold?: number;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=8');
        const data = await res.json();
        setFeaturedProducts(data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const benefits = [
    {
      icon: <FiTruck className="w-8 h-8 text-amber-600" />,
      title: "Livraison Rapide",
      description: "Expédition sous 24h en Algérie"
    },
    {
      icon: <FiRefreshCw className="w-8 h-8 text-amber-600" />,
      title: "Retours Faciles",
      description: "30 jours pour changer d'avis"
    },
    {
      icon: <FiShield className="w-8 h-8 text-amber-600" />,
      title: "Paiement Sécurisé",
      description: "CB ou paiement à la livraison"
    },
    {
      icon: <FiStar className="w-8 h-8 text-amber-600" />,
      title: "Artisanat Local",
      description: "Fabriqué avec passion en Algérie"
    }
  ];





  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navigation />
   {/* Hero Banner with Algerian motifs and modern design */}

<div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white">
  {/* Top Wave Shape */}
  <svg
    className="absolute top-0 left-0 w-full z-0"
    viewBox="0 0 1440 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      fill="#fff"
      d="M0,64L60,80C120,96,240,128,360,138.7C480,149,600,139,720,122.7C840,107,960,85,1080,96C1200,107,1320,149,1380,170.7L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
    />
  </svg>

  {/* Algerian pattern background layer */}
  <div className="absolute inset-0 bg-[url('/images/geometric-pattern.png')] bg-repeat opacity-10 z-0" />

  {/* Content Container */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40 flex flex-col md:flex-row items-center">
    {/* Text Column */}
    <div className="md:w-1/2 text-center md:text-left mb-16 md:mb-0">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight font-serif drop-shadow-md">
        L'Élégance <span className="text-amber-600">Algérienne</span> Réinventée
      </h1>
      <p className="mt-6 text-xl text-gray-600 max-w-md mx-auto md:mx-0">
        Découvrez notre collection exclusive de vêtements traditionnels modernisés, fabriqués à la main par nos artisans locaux.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
        <Link 
          href="/shop" 
          className="px-8 py-3 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 transition inline-flex items-center shadow-lg hover:shadow-amber-200"
        >
          <FiShoppingBag className="mr-2" />
          Explorer la collection
        </Link>
        <Link 
          href="/about" 
          className="px-8 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-full hover:bg-amber-50 transition inline-flex items-center"
        >
          Notre histoire
        </Link>
      </div>
    </div>

    {/* Image Column */}
    <div className="md:w-1/2 relative">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
        <Image 
          src="/images/picture(1).jpg" 
          alt="Modèle vêtement MAEVA" 
          width={600} 
          height={800} 
          className="w-full h-auto"
          priority
        />
      
      </div>
    </div>
  </div>
</div>


      {/* Benefits Section with Algerian geometric design */}
      <div className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/geometric-pattern.png')] bg-repeat opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Pourquoi Choisir MAEVA ?</h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience d'achat unique alliant tradition et modernité
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traditional Collections */}
      <div className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Nos Collections <span className="text-amber-600">Traditionnelles</span></h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Redécouvrez les costumes régionaux algériens réinterprétés avec élégance
            </p>
          </div>

         
<CollectionGrid/>          
        
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Nos <span className="text-amber-600">Best-Sellers</span></h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les préférés de nos clients
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg animate-pulse aspect-square"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <Link href={`/product/${product._id}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      {product.imageUrls?.[0] ? (
                        <Image
                          src={product.imageUrls[0]}
                          alt={product.name}
                          fill
                          sizes='40'
                          className="object-cover group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <FiShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                      {product.promotion && (
                        <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">
                          PROMO
                        </span>
                      )}
                      {product.sold && product.sold > 10 && (
                        <span className="absolute top-2 right-2 bg-white text-amber-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                          {product.sold}+ vendus
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2 capitalize">{product.category}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          {product.promotion && product.promoPrice ? (
                            <>
                              <span className="font-bold text-amber-600">{product.promoPrice.toFixed(2)} DA</span>
                              <span className="ml-2 text-xs text-gray-500 line-through">{product.price.toFixed(2)} DA</span>
                            </>
                          ) : (
                            <span className="font-bold text-amber-600">{product.price.toFixed(2)} DA</span>
                          )}
                        </div>
                        {product.stock > 0 ? (
                          <span className="text-xs text-green-500">En stock</span>
                        ) : (
                          <span className="text-xs text-red-500">Rupture</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button className="w-full py-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <FiShoppingBag size={14} />
                    Ajouter au panier
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              href="/shop" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-amber-500 hover:bg-amber-400"
            >
              Voir toute la boutique
              <FiChevronRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Algerian Craftsmanship */}
      <div className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/image2.jpg" 
                  alt="Artisan Algérien au travail" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                  <p className="text-sm">Artisan de Tlemcen travaillant sur une pièce MAEVA</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Savoir-Faire <span className="text-amber-600">Algérien</span></h2>
              <p className="text-lg text-gray-600 mb-6">
                Chaque pièce MAEVA est le fruit d'un héritage artisanal transmis de génération en génération, combiné à une vision contemporaine de la mode.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Soie et coton 100% algériens",
                  "Teintures végétales naturelles",
                  "Broderies traditionnelles faites main",
                  "Contrôle qualité rigoureux",
                  "Emploi local et commerce équitable"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-amber-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/about" 
                  className="px-6 py-3 bg-amber-600 text-gray-200 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center justify-center shadow hover:shadow-md"
                >
                  Notre histoire
                </Link>
                <Link 
                  href="/artisans" 
                  className="px-6 py-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors inline-flex items-center justify-center"
                >
                  Rencontrez nos artisans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Ils parlent de <span className="text-amber-600">nous</span></h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ce que nos clients disent de leur expérience MAEVA
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "La qualité des broderies est exceptionnelle. J'ai reçu de nombreux compliments sur ma tenue MAEVA lors d'un mariage.",
                author: "Anonyme",
                location: "Alger",
                rating: 5
              },
              {
                quote: "Enfin une marque qui valorise notre patrimoine avec une telle modernité. Le service client est également impeccable.",
                author: "Anonyme",
                location: "Oran",
                rating: 5
              },
              {
                quote: "J'ai offert une pièce MAEVA à ma mère en France, elle était tellement émue de retrouver des motifs de son enfance.",
                author: "Anonyme",
                location: "Paris",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <blockquote className="text-gray-600 italic mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-100 rounded-full p-2">
                    <FiStar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter with Algerian pattern */}
      <div className="py-16 bg-gradient-to-r from-amber-400 to-amber-600 text-white relative overflow-hidden">
      <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Notre Actualité <span className="text-amber-600">Vestimentaire</span></h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Decouvrir  les modèls algériens réinterprétés avec élégance
            </p>
          </div>
        <BlogGrid/>
      </div>

      <Footer />
    </div>
  );
}