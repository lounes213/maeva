'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CollectionCardProps {
  collection: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    productCount?: number;
  };
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export function CollectionCard({ collection, variant = 'default', className = '' }: CollectionCardProps) {
  // Determine the appropriate classes based on the variant
  const cardClasses = {
    default: 'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group',
    featured: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover-lift',
    compact: 'bg-white rounded-lg shadow-sm hover:shadow transition-all duration-300 overflow-hidden flex',
  };

  return (
    <Link 
      href={`/collection/${collection._id}`}
      className={`${cardClasses[variant]} ${className}`}
    >
      {variant === 'compact' ? (
        // Compact layout (horizontal)
        <>
          <div className="relative w-24 h-24 flex-shrink-0">
            {collection.image ? (
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 96px"
              />
            ) : (
              <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-xl">M</span>
              </div>
            )}
          </div>
          <div className="p-3 flex-grow">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">{collection.name}</h3>
            {collection.description && (
              <p className="text-xs text-gray-500 line-clamp-1">{collection.description}</p>
            )}
            {collection.productCount !== undefined && (
              <p className="text-xs text-amber-600 mt-1">{collection.productCount} produits</p>
            )}
          </div>
        </>
      ) : (
        // Default and Featured layouts (vertical)
        <>
          <div className="relative aspect-square overflow-hidden">
            {collection.image ? (
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-3xl">MAEVA</span>
              </div>
            )}
            
            {/* Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70 transition-opacity group-hover:opacity-80"></div>
            
            {/* Collection name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className={`font-semibold mb-1 ${variant === 'featured' ? 'text-2xl' : 'text-xl'}`}>
                {collection.name}
              </h3>
              
              {collection.productCount !== undefined && (
                <p className="text-sm text-amber-200 font-medium">
                  {collection.productCount} produits
                </p>
              )}
              
              <div className="mt-3 flex items-center text-amber-100 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Découvrir
                <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          
          {variant === 'featured' && collection.description && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <p className="text-gray-600 text-sm line-clamp-2">{collection.description}</p>
            </div>
          )}
        </>
      )}
    </Link>
  );
}