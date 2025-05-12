'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/header';
import Footer from '../components/footer';
import { ProductFilters } from '@/components/ui/product-filters';
import { ProductGrid } from '@/components/ui/product-grid';
import { ProductSort } from '@/components/ui/product-sort';
import { Input } from '@/components/ui/input';
import { ModernButton } from '@/components/ui/modern-button';

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
  createdAt: string;
  rating?: number;
  sold?: number;
}

export default function ModernShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Color name mapping with French names and hex values
  const colorNameMap: Record<string, { french: string; hex: string }> = {
    white: { french: 'Blanc', hex: '#ffffff' },
    black: { french: 'Noir', hex: '#000000' },
    red: { french: 'Rouge', hex: '#ff0000' },
    blue: { french: 'Bleu', hex: '#0000ff' },
    green: { french: 'Vert', hex: '#00ff00' },
    yellow: { french: 'Jaune', hex: '#ffff00' },
    gray: { french: 'Gris', hex: '#808080' },
    silver: { french: 'Argent', hex: '#c0c0c0' },
    gold: { french: 'Or', hex: '#ffd700' },
    navy: { french: 'Bleu marine', hex: '#000080' },
    'royal-blue': { french: 'Bleu royal', hex: '#4169e1' },
    'sky-blue': { french: 'Bleu ciel', hex: '#87ceeb' },
    turquoise: { french: 'Turquoise', hex: '#40e0d0' },
    teal: { french: 'Bleu sarcelle', hex: '#008080' },
    emerald: { french: 'Émeraude', hex: '#50c878' },
    lime: { french: 'Vert citron', hex: '#32cd32' },
    olive: { french: 'Olive', hex: '#808000' },
    maroon: { french: 'Bordeaux', hex: '#800000' },
    crimson: { french: 'Cramoisi', hex: '#dc143c' },
    pink: { french: 'Rose', hex: '#ffc0cb' },
    fuchsia: { french: 'Fuchsia', hex: '#ff00ff' },
    purple: { french: 'Violet', hex: '#800080' },
    lavender: { french: 'Lavande', hex: '#e6e6fa' },
    violet: { french: 'Violet', hex: '#8a2be2' },
    indigo: { french: 'Indigo', hex: '#4b0082' },
    beige: { french: 'Beige', hex: '#f5f5dc' },
    brown: { french: 'Marron', hex: '#a52a2a' },
    chocolate: { french: 'Chocolat', hex: '#d2691e' },
    orange: { french: 'Orange', hex: '#ffa500' },
    coral: { french: 'Corail', hex: '#ff7f50' },
    salmon: { french: 'Saumon', hex: '#fa8072' },
    tan: { french: 'Havane', hex: '#d2b48c' },
    khaki: { french: 'Kaki', hex: '#f0e68c' }
  };

  const getColorModel = (color: string) => {
    if (color.startsWith('#')) {
      return { french: color, hex: color };
    }
    return colorNameMap[color.toLowerCase()] || { french: color, hex: '#cccccc' };
  };

  const processColors = (colors: string[] | undefined) => {
    if (!colors || colors.length === 0) return [];
    
    const processedColors: string[] = [];
    colors.forEach(colorItem => {
      if (colorItem.includes(',')) {
        colorItem.split(',').forEach(color => {
          if (color.trim()) processedColors.push(color.trim());
        });
      } else {
        processedColors.push(colorItem);
      }
    });
    
    return processedColors;
  };

  const processSizes = (sizes: string[] | undefined) => {
    if (!sizes || sizes.length === 0) return [];
    return sizes.flatMap(sizeItem => sizeItem.split(',').map(size => size.trim()));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data.data || []);
        
        if (data.data?.length > 0) {
          const prices = data.data.map((p: Product) => p.price);
          const maxPrice = Math.ceil(Math.max(...prices) / 1000) * 1000;
          setMaxPrice(maxPrice);
          setPriceRange([0, maxPrice]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract filter options from products
  const categories = Array.from(new Set(products.map(p => p.category)))
    .map(category => ({
      id: category,
      label: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
      count: products.filter(p => p.category === category).length
    }));

  const colors = Array.from(new Set(
    products.flatMap(p => processColors(p.couleurs || []))
  )).map(color => {
    const colorInfo = getColorModel(color);
    return {
      id: color,
      label: colorInfo.french,
      hex: colorInfo.hex,
      count: products.filter(p => 
        processColors(p.couleurs || []).includes(color)
      ).length
    };
  });

  const sizes = Array.from(new Set(
    products.flatMap(p => processSizes(p.taille || []))
  )).map(size => ({
    id: size,
    label: size,
    count: products.filter(p => 
      processSizes(p.taille || []).includes(size)
    ).length
  }));

  // Filter products based on selected filters and search query
  const filteredProducts = products.filter(product => {
    // Price filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
    
    // Color filter
    if (selectedColors.length > 0 && product.couleurs) {
      const processedProductColors = processColors(product.couleurs);
      if (!processedProductColors.some(color => selectedColors.includes(color))) return false;
    } else if (selectedColors.length > 0 && !product.couleurs) {
      return false;
    }
    
    // Size filter
    if (selectedSizes.length > 0 && product.taille) {
      const processedProductSizes = processSizes(product.taille);
      if (!processedProductSizes.some(size => selectedSizes.includes(size))) return false;
    } else if (selectedSizes.length > 0 && !product.taille) {
      return false;
    }
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'popular': return (b.sold || 0) - (a.sold || 0);
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery('');
  };

  const sortOptions = [
    { value: 'newest', label: 'Nouveautés' },
    { value: 'price-low', label: 'Prix: croissant' },
    { value: 'price-high', label: 'Prix: décroissant' },
    { value: 'popular', label: 'Plus populaires' },
    { value: 'rating', label: 'Meilleures notes' }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-amber-50 to-white overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[url('/images/geometric-pattern.png')] bg-repeat opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Boutique <span className="text-amber-600">MAEVA</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Découvrez notre collection exclusive de vêtements algériens traditionnels et modernes
          </motion.p>
          <motion.div 
            className="w-24 h-1 bg-amber-600 mx-auto mt-6"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          ></motion.div>
          
          {/* Search bar */}
          <motion.div 
            className="max-w-2xl mx-auto mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 pr-4 rounded-full border-gray-200 shadow-md focus-visible:ring-amber-500"
              />
              <ModernButton
                variant="primary"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
              >
                Rechercher
              </ModernButton>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">
            {filteredProducts.length === products.length ? (
              'Tous nos produits'
            ) : (
              <>
                Produits filtrés <span className="text-amber-600">({filteredProducts.length})</span>
              </>
            )}
          </h2>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={clearFilters}
              className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
            >
              Réinitialiser les filtres
            </button>
            <ProductSort
              options={sortOptions}
              value={sortOption}
              onChange={setSortOption}
              className="w-48"
            />
          </div>
        </div>

        {/* Mobile Filters Row - Only visible on small screens */}
        <div className="md:hidden w-full mb-8 flex flex-wrap gap-4 items-center">
          {/* Price Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Prix:</span>
            <select 
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              value={`${priceRange[0]}-${priceRange[1]}`}
              onChange={(e) => {
                const [min, max] = e.target.value.split('-').map(Number);
                setPriceRange([min, max]);
              }}
            >
              <option value={`0-${maxPrice}`}>Tous les prix</option>
              <option value="0-1000">Moins de 1000 DA</option>
              <option value="1000-3000">1000 DA - 3000 DA</option>
              <option value="3000-5000">3000 DA - 5000 DA</option>
              <option value={`5000-${maxPrice}`}>Plus de 5000 DA</option>
            </select>
          </div>
          
          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedCategories.includes(category.id)
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Main Content with Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar - Hidden on mobile */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <ProductFilters
              categories={categories}
              colors={colors}
              sizes={sizes}
              priceRange={{
                min: 0,
                max: maxPrice,
                current: priceRange
              }}
              selectedCategories={selectedCategories}
              selectedColors={selectedColors}
              selectedSizes={selectedSizes}
              onCategoryChange={toggleCategory}
              onColorChange={toggleColor}
              onSizeChange={toggleSize}
              onPriceChange={handlePriceChange}
              onClearFilters={clearFilters}
              totalProducts={products.length}
              filteredCount={filteredProducts.length}
              className="sticky top-24"
            />
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid
              products={sortedProducts}
              loading={loading}
              emptyMessage={searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucun produit ne correspond à vos filtres"}
              columns={3}
            />
          </div>
        </div>
      </div>
      
      {/* Featured Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Catégories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explorez notre sélection de vêtements traditionnels algériens, soigneusement conçus pour allier authenticité et modernité.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((category, index) => (
              <motion.div
                key={category.id}
                className="relative rounded-xl overflow-hidden aspect-[4/3] group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Image
                  src={`/images/category-${index + 1}.jpg`}
                  alt={category.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <h3 className="text-2xl font-bold mb-2">{category.label}</h3>
                  <p className="text-amber-200 mb-4">{category.count} produits</p>
                  <Link href={`/shop?category=${category.id}`}>
                    <ModernButton variant="secondary" size="sm">
                      Découvrir
                    </ModernButton>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter section removed */}
      
      <Footer />
    </div>
  );
}