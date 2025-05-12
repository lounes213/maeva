'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface ProductSortProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ProductSort({
  options,
  value,
  onChange,
  className = '',
}: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md pl-4 pr-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <ArrowUpDown className="w-4 h-4 mr-2 text-amber-500" />
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing the dropdown */}
            <motion.div
              className="fixed inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 focus:outline-none"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  className={`flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-50 ${
                    option.value === value ? 'text-amber-600 bg-amber-50' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}