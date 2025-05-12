'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './product-card';
import { Loader2 } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  tissu?: string;
  couleurs?: string[];
  taille?: string[];
  promotion?: boolean;
  promoPrice?: number;
  imageUrls?: string[];
  createdAt?: string;
  rating?: number;
  sold?: number;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ProductGrid({
  products,
  loading = false,
  emptyMessage = "Aucun produit trouvé",
  columns = 4,
  variant = 'default',
  className = '',
}: ProductGridProps) {
  // Define grid columns based on the columns prop
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for each item
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-square">
            <div className="w-full h-full relative overflow-hidden rounded-t-xl">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
            </div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-amber-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 max-w-md">
          Essayez de modifier vos filtres ou de rechercher un autre terme.
        </p>
      </motion.div>
    );
  }

  // Product grid
  return (
    <motion.div 
      className={`grid ${gridCols[columns]} gap-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product, index) => (
        <motion.div 
          key={product._id} 
          variants={itemVariants}
          className="h-full"
        >
          <ProductCard 
            product={product} 
            variant={variant} 
          />
        </motion.div>
      ))}
    </motion.div>
  );
}