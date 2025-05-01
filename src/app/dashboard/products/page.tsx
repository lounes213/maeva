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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-white lg:grid lg:h-screen ">
          <DashboardHeader user={{}}  />

      <div className="max-w-7xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6 mt-4">
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <button onClick={() => setIsFormModalOpen(true)} className="hover:bg-indigo-700 justify-center items-center flex">
           <IoAddCircle className="text-2xl" />
            <span className="ml-2">Ajouter un Produit</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ProductTable products={products} refreshProducts={fetchProducts} />
          </div>
        )}

        {/* Add Product Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title="Add New Product"
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