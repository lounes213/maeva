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
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Erreur ${response.status}: Impossible de récupérer les produits`);
      }
      
      const data = await response.json();
      
      // Check if data.products exists (new API format) or fall back to data.data (old format)
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Format de réponse API inattendu');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des produits');
      setProducts([]); // Set empty array to avoid undefined errors
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
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-red-800">Erreur lors du chargement des produits</h3>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <div className="mt-6">
                <button
                  onClick={fetchProducts}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun produit disponible. Ajoutez votre premier produit en cliquant sur le bouton ci-dessus.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Liste des produits ({products.length})</h2>
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