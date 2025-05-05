'use client';
import { useState, useEffect } from 'react';
import { FiFilter, FiX, FiChevronDown, FiShoppingBag, FiStar, FiCheck } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/header';
import { CldImage } from 'next-cloudinary';
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

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // State for filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');

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

  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000000' : '#ffffff';
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

    // Séparer chaque taille individuellement, même si elles sont groupées
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
  const categories = Array.from(new Set(products.map(p => p.category)));
const colors = Array.from(new Set(
  products.flatMap(p => processColors(p.couleurs || []))
));
  const sizes = Array.from(new Set(products.flatMap(p => p.taille || [])));

 // Update the filtering for colors
const filteredProducts = products.filter(product => {
  if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
  if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
  
  // Improved color filtering - process the colors first
  if (selectedColors.length > 0 && product.couleurs) {
    const processedProductColors = processColors(product.couleurs);
    if (!processedProductColors.some(color => selectedColors.includes(color))) return false;
  } else if (selectedColors.length > 0 && !product.couleurs) {
    return false;
  }
  
  if (selectedSizes.length > 0 && product.taille && 
      !processSizes(product.taille).some(size => selectedSizes.includes(size))) return false;
  return true;
});

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

  return (
    <div className="bg-white">
      <Header/>
      <div className="relative bg-gradient-to-b from-amber-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/geometric-pattern.png')] bg-repeat opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-4">
            Boutique <span className="text-amber-600">MAEVA</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez notre collection exclusive de vêtements algériens traditionnels et modernes
          </p>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-6"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="newest">Nouveautés</option>
                <option value="price-low">Prix: croissant</option>
                <option value="price-high">Prix: décroissant</option>
                <option value="popular">Plus populaires</option>
                {products.some(p => p.rating) && <option value="rating">Meilleures notes</option>}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FiChevronDown />
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md shadow hover:bg-amber-700 transition-colors"
            >
              <FiFilter />
              Filtres
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-medium text-gray-900 mb-4">Prix (DA)</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max={priceRange[1]}
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0 DA</span>
                    <span>{priceRange[1].toLocaleString()} DA</span>
                  </div>
                </div>
              </div>

              {categories.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Catégories</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <button
                          onClick={() => toggleCategory(category)}
                          className={`flex items-center justify-center w-5 h-5 rounded border ${
                            selectedCategories.includes(category)
                              ? 'bg-amber-600 border-amber-600 text-white'
                              : 'border-gray-300 text-transparent'
                          }`}
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                        <label 
                          onClick={() => toggleCategory(category)}
                          className="ml-3 text-sm text-gray-600 capitalize cursor-pointer"
                        >
                          {category.toLowerCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Couleurs</h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => {
                      const colorInfo = getColorModel(color);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            selectedColors.includes(color)
                              ? 'border-amber-600 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: colorInfo.hex }}
                          title={colorInfo.french}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Tailles</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from(new Set(sizes.flatMap(size => 
                      size.split(',').map(s => s.trim())
                    ))).sort().map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`
                          flex items-center justify-center px-3 py-2 rounded-md text-sm
                          ${selectedSizes.includes(size)
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-gray-600 border border-gray-300 hover:border-amber-600 hover:text-amber-600'
                          }
                          transition-all duration-200
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(selectedCategories.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[1] < Math.max(...products.map(p => p.price))) && (
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedColors([]);
                    setSelectedSizes([]);
                    setPriceRange([0, Math.max(...products.map(p => p.price))]);
                  }}
                  className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                >
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg animate-pulse aspect-[3/4]"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-amber-50 rounded-lg">
                <div className="max-w-md mx-auto">
                  <FiX className="mx-auto h-12 w-12 text-amber-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun produit trouvé</h3>
                  <p className="mt-1 text-gray-500 mb-6">
                    Aucun produit ne correspond à vos critères de recherche.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedColors([]);
                      setSelectedSizes([]);
                      setPriceRange([0, Math.max(...products.map(p => p.price))]);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {sortedProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  >
                    <Link href={`/product/${product._id}`} className="block relative">
                      <div className="aspect-[3/4] relative bg-gray-50 overflow-hidden">
                        {product.imageUrls?.[0] ? (

  


 
    <CldImage
       src={product.imageUrls[0]}
      alt={product.name}// Use this sample image or upload your own via the Media Explorer
      width="500" // Transform the image: auto-crop to square aspect_ratio
      height="500"
       className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority
      crop={{
        type: 'auto',
        source: true
      }}
  />

                        ): (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiShoppingBag className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-0 left-0 w-full p-4 space-y-2">
                          {product.promotion && (
                            <span className="inline-block bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                              PROMO
                            </span>
                          )}
                          {product.sold && product.sold > 5 && (
                            <div className="inline-flex items-center bg-white/95 backdrop-blur-sm text-amber-600 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                              <FiStar className="w-3 h-3 mr-1" fill="currentColor" />
                              {product.sold}+ vendus
                            </div>
                          )}
                        </div>
                        {product.stock <= 5 && product.stock > 0 && (
                          <div className="absolute bottom-0 left-0 w-full p-4">
                            <div className="bg-orange-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full text-center animate-pulse">
                              Plus que {product.stock} en stock !
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize flex items-center">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                            {product.category.toLowerCase()}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-1">
                            {product.promotion && product.promoPrice ? (
                              <>
                                <div className="font-bold text-xl text-red-500">{product.promoPrice.toLocaleString()} DA</div>
                                <div className="text-sm text-gray-400 line-through">{product.price.toLocaleString()} DA</div>
                                <div className="text-xs text-green-600 font-medium">
                                  -{Math.round(((product.price - product.promoPrice) / product.price) * 100)}%
                                </div>
                              </>
                            ) : (
                              <div className="font-bold text-xl text-amber-600">{product.price.toLocaleString()} DA</div>
                            )}
                          </div>
                          {product.rating && (
                            <div className="flex items-center bg-amber-50 px-3 py-2 rounded-lg">
                              <FiStar className="text-amber-500 w-4 h-4" fill="currentColor" />
                              <span className="ml-1.5 font-semibold text-amber-700">{product.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {product.tissu && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                              Tissu: <span className="font-medium ml-1">{product.tissu}</span>
                            </p>
                          )}
                          
                          {product.couleurs && product.couleurs.length > 0 && (
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">Couleurs:</span>
                              <div className="flex -space-x-2 hover:space-x-1 transition-all duration-200">
                                {processColors(product.couleurs).slice(0, 4).map((color) => {
                                  const colorInfo = getColorModel(color);
                                  return (
                                    <span
                                      key={color}
                                      className="w-7 h-7 rounded-full border-2 border-white ring-2 ring-gray-200 transition-transform hover:scale-110 hover:z-10"
                                      style={{ backgroundColor: colorInfo.hex }}
                                      title={colorInfo.french}
                                    />
                                  );
                                })}
                                {processColors(product.couleurs).length > 4 && (
                                  <span className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white ring-2 ring-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 hover:scale-110 hover:z-10 transition-transform">
                                    +{processColors(product.couleurs).length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {product.taille && product.taille.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                              <span className="text-sm text-gray-500 flex-shrink-0">Tailles:</span>
                              <div className="flex gap-1.5">
                                {processSizes(product.taille).map((size) => (
                                  <span
                                    key={size}
                                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="p-6 pt-0">
                      <button 
                        className={`
                          w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-medium
                          transition-all duration-300 transform hover:scale-[1.02]
                          ${product.stock > 0
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl hover:shadow-amber-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }
                        `}
                        disabled={product.stock <= 0}
                      >
                        <FiShoppingBag className={product.stock > 0 ? 'text-white' : 'text-gray-400'} size={18} />
                        {product.stock > 0 ? 'Ajouter au panier' : 'En rupture'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileFiltersOpen(false)}
            />
            
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Filtres</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Prix (DA)</h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max={priceRange[1]}
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0 DA</span>
                      <span>{priceRange[1].toLocaleString()} DA</span>
                    </div>
                  </div>
                </div>

                {categories.length > 0 && (
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="font-medium text-gray-900 mb-4">Catégories</h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center">
                          <button
                            onClick={() => toggleCategory(category)}
                            className={`flex items-center justify-center w-5 h-5 rounded border ${
                              selectedCategories.includes(category)
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'border-gray-300 text-transparent'
                            }`}
                          >
                            <FiCheck className="w-3 h-3" />
                          </button>
                          <label 
                            onClick={() => toggleCategory(category)}
                            className="ml-3 text-sm text-gray-600 capitalize cursor-pointer"
                          >
                            {category.toLowerCase()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {colors.length > 0 && (
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="font-medium text-gray-900 mb-4">Couleurs</h3>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => {
                        const colorInfo = getColorModel(color);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => toggleColor(color)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                              selectedColors.includes(color)
                                ? 'border-amber-600 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: colorInfo.hex }}
                            title={colorInfo.french}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="font-medium text-gray-900 mb-4">Tailles</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from(new Set(sizes.flatMap(size => 
                        size.split(',').map(s => s.trim())
                      ))).sort().map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`
                            flex items-center justify-center px-3 py-2 rounded-md text-sm
                            ${selectedSizes.includes(size)
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-gray-600 border border-gray-300 hover:border-amber-600 hover:text-amber-600'
                            }
                            transition-all duration-200
                          `}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedColors([]);
                      setSelectedSizes([]);
                      setPriceRange([0, Math.max(...products.map(p => p.price))]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700"
                  >
                    Voir les produits
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}