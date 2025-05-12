'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, AlertCircle } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import { ModernButton } from '@/components/ui/modern-button';

// Define the type for wishlist items
interface WishlistItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

// Placeholder for wishlist functionality
export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // In a real app, you would fetch the wishlist items from an API or local storage
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const removeFromWishlist = (productId: number): void => {
    // This would remove the item from the wishlist
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Favoris</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : wishlistItems.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row p-6">
                    <div className="flex-shrink-0 w-full sm:w-32 h-32 mb-4 sm:mb-0 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 sm:ml-6">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <button 
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{item.price} DA</p>
                      <div className="mt-4 flex space-x-2">
                        <ModernButton variant="primary" size="sm" className="flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Ajouter au panier
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-amber-100 mb-4">
                <Heart className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Votre liste de favoris est vide</h2>
              <p className="text-gray-500 mb-6">
                Parcourez notre boutique et ajoutez des produits à vos favoris pour les retrouver ici.
              </p>
              <Link href="/shop">
                <ModernButton variant="primary">
                  Découvrir nos produits
                </ModernButton>
              </Link>
            </div>
          )}
          
          {wishlistItems.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/shop">
                <ModernButton variant="outline">
                  Continuer mes achats
                </ModernButton>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}