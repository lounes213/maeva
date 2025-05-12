'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChevronDown, ChevronUp, X, Filter, SlidersHorizontal, 
  Search, RefreshCw, Tag, Palette, Ruler
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ModernButton } from '@/components/ui/modern-button';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface ColorOption extends FilterOption {
  hex: string;
}

interface PriceRange {
  min: number;
  max: number;
  current: [number, number];
}

interface ProductFiltersProps {
  categories: FilterOption[];
  colors: ColorOption[];
  sizes: FilterOption[];
  priceRange: PriceRange;
  selectedCategories: string[];
  selectedColors: string[];
  selectedSizes: string[];
  onCategoryChange: (category: string) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  totalProducts: number;
  filteredCount: number;
  className?: string;
}

export function ProductFilters({
  categories,
  colors,
  sizes,
  priceRange,
  selectedCategories,
  selectedColors,
  selectedSizes,
  onCategoryChange,
  onColorChange,
  onSizeChange,
  onPriceChange,
  onClearFilters,
  totalProducts,
  filteredCount,
  className = '',
}: ProductFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    colors: true,
    sizes: true,
    price: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [priceInputs, setPriceInputs] = useState<[number, number]>(priceRange.current);

  // Update price inputs when priceRange changes
  useEffect(() => {
    setPriceInputs(priceRange.current);
  }, [priceRange]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceInputChange = (index: 0 | 1, value: string) => {
    const numValue = parseInt(value) || 0;
    const newInputs = [...priceInputs] as [number, number];
    newInputs[index] = numValue;
    setPriceInputs(newInputs);
  };

  const applyPriceFilter = () => {
    // Ensure min <= max
    const sortedInputs: [number, number] = [
      Math.min(priceInputs[0], priceInputs[1]),
      Math.max(priceInputs[0], priceInputs[1])
    ];
    
    // Ensure within bounds
    const boundedInputs: [number, number] = [
      Math.max(sortedInputs[0], priceRange.min),
      Math.min(sortedInputs[1], priceRange.max)
    ];
    
    onPriceChange(boundedInputs);
  };

  // Filter options based on search query
  const filteredCategories = searchQuery 
    ? categories.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;
    
  const filteredSizes = searchQuery 
    ? sizes.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : sizes;
    
  const filteredColors = searchQuery 
    ? colors.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : colors;

  // Calculate active filters count
  const activeFiltersCount = 
    selectedCategories.length + 
    selectedColors.length + 
    selectedSizes.length + 
    (priceRange.current[0] > priceRange.min || priceRange.current[1] < priceRange.max ? 1 : 0);

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' DA';
  };

  return (
    <>
      {/* Mobile filter dialog */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div 
            className="fixed inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
            
            <motion.div 
              className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium">Filtres</h2>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {/* Mobile filters content - same as desktop but styled for mobile */}
                <div className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Rechercher dans les filtres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50 border-gray-200"
                    />
                  </div>
                  
                  {/* Active filters summary */}
                  {activeFiltersCount > 0 && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-800">
                          {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                        </span>
                        <button 
                          onClick={onClearFilters}
                          className="text-xs text-amber-600 hover:text-amber-800 flex items-center"
                        >
                          <RefreshCw size={12} className="mr-1" />
                          Réinitialiser
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-amber-700">
                        {filteredCount} produit{filteredCount > 1 ? 's' : ''} sur {totalProducts}
                      </div>
                    </div>
                  )}
                  
                  {/* Price Range */}
                  <div className="border-b border-gray-200 pb-6">
                    <button 
                      className="flex items-center justify-between w-full text-left"
                      onClick={() => toggleSection('price')}
                    >
                      <div className="flex items-center">
                        <Tag size={18} className="mr-2 text-amber-600" />
                        <h3 className="font-medium text-gray-900">Prix</h3>
                      </div>
                      {expandedSections.price ? (
                        <ChevronUp size={18} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.price && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={priceRange.min}
                                max={priceRange.max}
                                value={priceInputs[0]}
                                onChange={(e) => handlePriceInputChange(0, e.target.value)}
                                className="w-full"
                              />
                              <span className="text-gray-500">à</span>
                              <Input
                                type="number"
                                min={priceRange.min}
                                max={priceRange.max}
                                value={priceInputs[1]}
                                onChange={(e) => handlePriceInputChange(1, e.target.value)}
                                className="w-full"
                              />
                              <ModernButton 
                                variant="outline" 
                                size="sm" 
                                onClick={applyPriceFilter}
                              >
                                OK
                              </ModernButton>
                            </div>
                            
                            <div className="pt-1 px-1">
                              <div className="relative h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="absolute h-2 bg-amber-500 rounded-full"
                                  style={{
                                    left: `${((priceRange.current[0] - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                                    right: `${100 - ((priceRange.current[1] - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                                  }}
                                />
                              </div>
                              <input
                                type="range"
                                min={priceRange.min}
                                max={priceRange.max}
                                value={priceRange.current[0]}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value <= priceRange.current[1]) {
                                    onPriceChange([value, priceRange.current[1]]);
                                  }
                                }}
                                className="absolute w-full h-2 opacity-0 cursor-pointer"
                              />
                              <input
                                type="range"
                                min={priceRange.min}
                                max={priceRange.max}
                                value={priceRange.current[1]}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value >= priceRange.current[0]) {
                                    onPriceChange([priceRange.current[0], value]);
                                  }
                                }}
                                className="absolute w-full h-2 opacity-0 cursor-pointer"
                              />
                            </div>
                            
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{formatPrice(priceRange.current[0])}</span>
                              <span>{formatPrice(priceRange.current[1])}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Categories */}
                  {filteredCategories.length > 0 && (
                    <div className="border-b border-gray-200 pb-6">
                      <button 
                        className="flex items-center justify-between w-full text-left"
                        onClick={() => toggleSection('categories')}
                      >
                        <div className="flex items-center">
                          <Filter size={18} className="mr-2 text-amber-600" />
                          <h3 className="font-medium text-gray-900">Catégories</h3>
                        </div>
                        {expandedSections.categories ? (
                          <ChevronUp size={18} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSections.categories && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                              {filteredCategories.map((category) => (
                                <div key={category.id} className="flex items-center">
                                  <button
                                    onClick={() => onCategoryChange(category.id)}
                                    className={`flex items-center justify-center w-5 h-5 rounded border ${
                                      selectedCategories.includes(category.id)
                                        ? 'bg-amber-600 border-amber-600 text-white'
                                        : 'border-gray-300 text-transparent hover:border-amber-300'
                                    }`}
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <label 
                                    onClick={() => onCategoryChange(category.id)}
                                    className="ml-3 text-sm text-gray-600 capitalize cursor-pointer flex-1 hover:text-amber-700"
                                  >
                                    {category.label}
                                  </label>
                                  {category.count !== undefined && (
                                    <span className="text-xs text-gray-400">
                                      ({category.count})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Colors */}
                  {filteredColors.length > 0 && (
                    <div className="border-b border-gray-200 pb-6">
                      <button 
                        className="flex items-center justify-between w-full text-left"
                        onClick={() => toggleSection('colors')}
                      >
                        <div className="flex items-center">
                          <Palette size={18} className="mr-2 text-amber-600" />
                          <h3 className="font-medium text-gray-900">Couleurs</h3>
                        </div>
                        {expandedSections.colors ? (
                          <ChevronUp size={18} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSections.colors && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 flex flex-wrap gap-3">
                              {filteredColors.map((color) => {
                                const isSelected = selectedColors.includes(color.id);
                                return (
                                  <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => onColorChange(color.id)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                                      isSelected
                                        ? 'ring-2 ring-offset-2 ring-amber-600 scale-110'
                                        : 'ring-1 ring-gray-200 hover:ring-amber-300'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.label}
                                  >
                                    {isSelected && (
                                      <Check 
                                        className="w-4 h-4" 
                                        color={color.hex === '#ffffff' || color.hex === '#f5f5dc' ? '#000000' : '#ffffff'} 
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Sizes */}
                  {filteredSizes.length > 0 && (
                    <div className="border-b border-gray-200 pb-6">
                      <button 
                        className="flex items-center justify-between w-full text-left"
                        onClick={() => toggleSection('sizes')}
                      >
                        <div className="flex items-center">
                          <Ruler size={18} className="mr-2 text-amber-600" />
                          <h3 className="font-medium text-gray-900">Tailles</h3>
                        </div>
                        {expandedSections.sizes ? (
                          <ChevronUp size={18} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSections.sizes && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              {filteredSizes.map((size) => (
                                <button
                                  key={size.id}
                                  onClick={() => onSizeChange(size.id)}
                                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                    selectedSizes.includes(size.id)
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-amber-200'
                                  }`}
                                >
                                  {size.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t flex justify-between">
                <ModernButton 
                  variant="outline" 
                  onClick={onClearFilters}
                  className="w-1/2 mr-2"
                >
                  Réinitialiser
                </ModernButton>
                <ModernButton 
                  variant="primary" 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-1/2 ml-2"
                >
                  Voir les résultats
                </ModernButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Desktop filters */}
      <div className={`hidden md:block ${className}`}>
        <div className="space-y-6">
          {/* Filter header with search */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 flex items-center">
              <SlidersHorizontal size={18} className="mr-2 text-amber-600" />
              Filtres
            </h3>
            
            {activeFiltersCount > 0 && (
              <button 
                onClick={onClearFilters}
                className="text-xs text-amber-600 hover:text-amber-800 flex items-center"
              >
                <RefreshCw size={12} className="mr-1" />
                Réinitialiser
              </button>
            )}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Rechercher dans les filtres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          
          {/* Active filters summary */}
          {activeFiltersCount > 0 && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-800">
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-2 text-xs text-amber-700">
                {filteredCount} produit{filteredCount > 1 ? 's' : ''} sur {totalProducts}
              </div>
            </div>
          )}
          
          {/* Price Range */}
          <div className="border-b border-gray-200 pb-6">
            <button 
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('price')}
            >
              <div className="flex items-center">
                <Tag size={18} className="mr-2 text-amber-600" />
                <h3 className="font-medium text-gray-900">Prix</h3>
              </div>
              {expandedSections.price ? (
                <ChevronUp size={18} className="text-gray-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections.price && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={priceInputs[0]}
                        onChange={(e) => handlePriceInputChange(0, e.target.value)}
                        className="w-full"
                      />
                      <span className="text-gray-500">à</span>
                      <Input
                        type="number"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={priceInputs[1]}
                        onChange={(e) => handlePriceInputChange(1, e.target.value)}
                        className="w-full"
                      />
                      <ModernButton 
                        variant="outline" 
                        size="sm" 
                        onClick={applyPriceFilter}
                      >
                        OK
                      </ModernButton>
                    </div>
                    
                    <div className="pt-1 px-1">
                      <div className="relative h-2 bg-gray-200 rounded-full">
                        <div 
                          className="absolute h-2 bg-amber-500 rounded-full"
                          style={{
                            left: `${((priceRange.current[0] - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                            right: `${100 - ((priceRange.current[1] - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={priceRange.current[0]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value <= priceRange.current[1]) {
                            onPriceChange([value, priceRange.current[1]]);
                          }
                        }}
                        className="absolute w-full h-2 opacity-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={priceRange.current[1]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= priceRange.current[0]) {
                            onPriceChange([priceRange.current[0], value]);
                          }
                        }}
                        className="absolute w-full h-2 opacity-0 cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange.current[0])}</span>
                      <span>{formatPrice(priceRange.current[1])}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Categories */}
          {filteredCategories.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('categories')}
              >
                <div className="flex items-center">
                  <Filter size={18} className="mr-2 text-amber-600" />
                  <h3 className="font-medium text-gray-900">Catégories</h3>
                </div>
                {expandedSections.categories ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.categories && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                      {filteredCategories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <button
                            onClick={() => onCategoryChange(category.id)}
                            className={`flex items-center justify-center w-5 h-5 rounded border ${
                              selectedCategories.includes(category.id)
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'border-gray-300 text-transparent hover:border-amber-300'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <label 
                            onClick={() => onCategoryChange(category.id)}
                            className="ml-3 text-sm text-gray-600 capitalize cursor-pointer flex-1 hover:text-amber-700"
                          >
                            {category.label}
                          </label>
                          {category.count !== undefined && (
                            <span className="text-xs text-gray-400">
                              ({category.count})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Colors */}
          {filteredColors.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('colors')}
              >
                <div className="flex items-center">
                  <Palette size={18} className="mr-2 text-amber-600" />
                  <h3 className="font-medium text-gray-900">Couleurs</h3>
                </div>
                {expandedSections.colors ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.colors && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 flex flex-wrap gap-3">
                      {filteredColors.map((color) => {
                        const isSelected = selectedColors.includes(color.id);
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => onColorChange(color.id)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'ring-2 ring-offset-2 ring-amber-600 scale-110'
                                : 'ring-1 ring-gray-200 hover:ring-amber-300'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.label}
                          >
                            {isSelected && (
                              <Check 
                                className="w-4 h-4" 
                                color={color.hex === '#ffffff' || color.hex === '#f5f5dc' ? '#000000' : '#ffffff'} 
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Sizes */}
          {filteredSizes.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('sizes')}
              >
                <div className="flex items-center">
                  <Ruler size={18} className="mr-2 text-amber-600" />
                  <h3 className="font-medium text-gray-900">Tailles</h3>
                </div>
                {expandedSections.sizes ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.sizes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {filteredSizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => onSizeChange(size.id)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            selectedSizes.includes(size.id)
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-amber-200'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile filter button */}
      <div className="md:hidden">
        <ModernButton
          variant="outline"
          size="sm"
          leftIcon={<Filter size={16} />}
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full"
        >
          Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </ModernButton>
      </div>
    </>
  );
}