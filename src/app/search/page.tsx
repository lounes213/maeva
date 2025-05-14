'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import { ModernButton } from '@/components/ui/modern-button';
import { useCart } from '@/app/context/cartContext';
import toast, { Toaster } from 'react-hot-toast';

// Define the Product type
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  promotion?: boolean;
  rating?: number;
  reviewCount?: number;
  imageUrls?: string[];
  images?: string[];
  category?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        if (!query) {
          setProducts([]);
          return;
        }
        
        // Use the dedicated search API endpoint
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success && data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          // Fallback to the products API if search API fails
          const productsResponse = await fetch('/api/products');
          const productsData = await productsResponse.json();
          
          let allProducts: Product[] = [];
          
          // Check if data.products exists (new API format) or fall back to data.data (old format)
          if (productsData.products && Array.isArray(productsData.products)) {
            allProducts = productsData.products;
          } else if (productsData.data && Array.isArray(productsData.data)) {
            allProducts = productsData.data;
          } else {
            throw new Error('Format de réponse API inattendu');
          }
          
          // Filter products based on search query
          const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
          
          const filteredProducts = allProducts.filter(product => {
            const nameMatch = product.name && searchTerms.some(term => 
              product.name.toLowerCase().includes(term)
            );
            
            const descriptionMatch = product.description && searchTerms.some(term => 
              product.description.toLowerCase().includes(term)
            );
            
            const categoryMatch = product.category && searchTerms.some(term => 
              product.category.toLowerCase().includes(term)
            );
            
            return nameMatch || descriptionMatch || categoryMatch;
          });
          
          setProducts(filteredProducts);
        }
      } catch (error) {
        // Silent error handling
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.promotion && product.promoPrice ? product.promoPrice : product.price,
      imageUrl: product.imageUrls && product.imageUrls.length > 0 
        ? product.imageUrls[0] 
        : (product.images && product.images.length > 0 
          ? product.images[0] 
          : '/images/placeholder.jpg'),
      quantity: 1
    };
    
    addToCart(cartItem);
    
    // Mark as added to cart
    setAddedToCart(prev => ({ ...prev, [product._id]: true }));
    
    // Show success toast
    toast.success('Produit ajouté au panier');
    
    // Reset the button after 2 seconds
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product._id]: false }));
    }, 2000);
  };

  // Function to handle adding to wishlist
  const handleAddToWishlist = (productId: string) => {
    // Get current wishlist from localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    // Check if product is already in wishlist
    if (!wishlist.includes(productId)) {
      // Add product to wishlist
      wishlist.push(productId);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      toast.success('Produit ajouté aux favoris');
    } else {
      // Remove from wishlist if already there
      const updatedWishlist = wishlist.filter((id: string) => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      toast.success('Produit retiré des favoris');
    }
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId: string) => {
    if (typeof window !== 'undefined') {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      return wishlist.includes(productId);
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <Header />
      
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Résultats de recherche</h1>
          <p className="text-gray-600 mb-8">
            {query ? `Résultats pour "${query}"` : 'Veuillez saisir un terme de recherche'}
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Link href={`/product/${product._id}`}>
                      <div className="relative h-64 w-full">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <Image
                            src={product.imageUrls[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No image</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    {/* Wishlist button */}
                    <button
                      onClick={() => handleAddToWishlist(product._id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                      />
                    </button>
                    
                    {/* Promotion badge */}
                    {product.promotion && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Promo
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <Link href={`/product/${product._id}`}>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Rating */}
                    {product.rating !== undefined && (
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-500">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="mt-2">
                      {product.promotion && product.promoPrice ? (
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-red-600">{product.promoPrice} DA</p>
                          <p className="text-sm text-gray-500 line-through">{product.price} DA</p>
                        </div>
                      ) : (
                        <p className="text-lg font-semibold text-gray-900">{product.price} DA</p>
                      )}
                    </div>
                    
                    {/* Add to cart button */}
                    <div className="mt-4">
                      <ModernButton
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                        disabled={addedToCart[product._id]}
                      >
                        {addedToCart[product._id] ? (
                          <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Ajouté
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 mr-1" />
                            Ajouter au panier
                          </span>
                        )}
                      </ModernButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              {query ? (
                <>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Aucun résultat trouvé</h2>
                  <p className="text-gray-500 mb-6">
                    Nous n'avons trouvé aucun produit correspondant à "{query}". Essayez avec d'autres termes ou parcourez notre boutique.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Rechercher des produits</h2>
                  <p className="text-gray-500 mb-6">
                    Utilisez la barre de recherche pour trouver des produits.
                  </p>
                </>
              )}
              <Link href="/shop">
                <ModernButton variant="primary">
                  Parcourir tous les produits
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