'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '@/app/context/cartContext';
import { ModernButton } from './modern-button';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: string;
    imageUrls?: string[];
    promotion?: boolean;
    promoPrice?: number;
    sold?: number;
    rating?: number;
    reviewCount?: number;
  };
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ProductCard({ product, variant = 'default', className = '' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast.error('Ce produit est en rupture de stock');
      return;
    }
    
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.promotion && product.promoPrice ? product.promoPrice : product.price,
      imageUrl: product.imageUrls?.[0] || '',
      quantity: 1
    });
    
    toast.success('Produit ajouté au panier');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleImageChange = () => {
    if (product.imageUrls && product.imageUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls!.length);
    }
  };

  // Determine the appropriate classes based on the variant
  const cardClasses = {
    default: 'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group',
    compact: 'bg-white rounded-lg shadow-sm hover:shadow transition-all duration-300 overflow-hidden flex',
    featured: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover-lift',
  };

  return (
    <Link 
      href={`/product/${product._id}`}
      className={`${cardClasses[variant]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {variant === 'compact' ? (
        // Compact layout (horizontal)
        <>
          <div className="relative w-24 h-24 flex-shrink-0">
            {product.imageUrls?.[0] ? (
              <Image
                src={product.imageUrls[currentImageIndex || 0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ShoppingCart className="w-6 h-6 text-gray-400" />
              </div>
            )}
            {product.promotion && (
              <span className="absolute top-1 left-1 bg-amber-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                PROMO
              </span>
            )}
          </div>
          <div className="p-3 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</h3>
              {product.category && (
                <p className="text-xs text-gray-500 capitalize">{product.category}</p>
              )}
            </div>
            <div className="flex justify-between items-center mt-2">
              <div>
                {product.promotion && product.promoPrice ? (
                  <div className="flex flex-col">
                    <span className="font-bold text-amber-600 text-sm">{product.promoPrice.toFixed(2)} DA</span>
                    <span className="text-xs text-gray-500 line-through">{product.price.toFixed(2)} DA</span>
                  </div>
                ) : (
                  <span className="font-bold text-amber-600 text-sm">{product.price.toFixed(2)} DA</span>
                )}
              </div>
              <button 
                onClick={handleAddToCart}
                className="text-amber-600 hover:text-amber-700"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        // Default and Featured layouts (vertical)
        <>
          <div 
            className="relative aspect-square overflow-hidden"
            onClick={handleImageChange}
          >
            {product.imageUrls?.[0] ? (
              <Image
                src={product.imageUrls[currentImageIndex || 0]}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-700 ${isHovered && product.imageUrls.length > 1 ? 'scale-110' : ''}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.promotion && (
                <span className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  PROMO
                </span>
              )}
              {product.stock <= 0 && (
                <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                  RUPTURE
                </span>
              )}
            </div>
            
            {product.sold && product.sold > 10 && (
              <span className="absolute top-2 right-2 bg-white text-amber-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {product.sold}+ vendus
              </span>
            )}
            
            {/* Action buttons that appear on hover */}
            <div className={`absolute right-2 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <button 
                onClick={handleToggleWishlist}
                className="bg-white p-2 rounded-full shadow-md hover:bg-amber-50 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
              </button>
              <button 
                className="bg-white p-2 rounded-full shadow-md hover:bg-amber-50 transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Product info */}
            <div className="mb-2">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
              {product.category && (
                <p className="text-sm text-gray-500 mb-1 capitalize">{product.category}</p>
              )}
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating!)
                            ? 'text-yellow-400 fill-yellow-400'
                            : i < product.rating!
                            ? 'text-yellow-400 fill-yellow-400 opacity-50'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {product.reviewCount && (
                    <span className="text-xs text-gray-500">({product.reviewCount})</span>
                  )}
                </div>
              )}
              
              {/* Price */}
              <div className="flex items-end gap-2">
                {product.promotion && product.promoPrice ? (
                  <>
                    <span className="font-bold text-amber-600">{product.promoPrice.toFixed(2)} DA</span>
                    <span className="text-xs text-gray-500 line-through">{product.price.toFixed(2)} DA</span>
                  </>
                ) : (
                  <span className="font-bold text-amber-600">{product.price.toFixed(2)} DA</span>
                )}
              </div>
            </div>
            
            {/* Add to cart button */}
            {variant === 'featured' ? (
              <ModernButton
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<ShoppingCart className="w-4 h-4" />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Ajouter au panier
              </ModernButton>
            ) : (
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 text-sm rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={14} />
                {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
              </button>
            )}
          </div>
        </>
      )}
    </Link>
  );
}