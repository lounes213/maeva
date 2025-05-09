'use client';

import { Product } from '@/app/types/product';
import React, { useState, useEffect } from 'react';
import Button from './components/updateProduct';
import ProductTable from './components/ProductTable';
import ProductForm from './components/NewProductForm';
import Modal from './components/modal';
import DashboardHeader from '@/app/dashboard/components/DashboardHeader';
import { IoAddCircle } from 'react-icons/io5';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
              <p className="mt-1 text-sm text-gray-500">Gérez votre catalogue de produits</p>
            </div>
            <button 
              onClick={() => setIsFormModalOpen(true)} 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out"
            >
              <IoAddCircle className="text-xl mr-2" />
              <span>Ajouter un Produit</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
              <p className="mt-4 text-sm text-gray-600">Chargement des produits...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Liste des produits</h2>
            </div>
            <ProductTable products={products} refreshProducts={fetchProducts} />
          </div>
        )}

        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title="Nouveau Produit"
        >
          <ProductForm
            onSuccess={() => {
              fetchProducts();
              setIsFormModalOpen(false);
            }}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ProductsPage;