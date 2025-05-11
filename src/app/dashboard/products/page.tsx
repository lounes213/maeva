// app/dashboard/products/page.tsx
'use client';
import { useState, useEffect } from 'react';
import ProductTable from './components/ProductTable';
import { Product } from '@/app/types/product';
import NewProductForm from './components/NewProductForm';
import CategoryManager from './components/CategoryManager';
import DashboardHeader from '../components/DashboardHeader';
import User from '@/models/User';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
 const [user, setUser] = useState(null);

  useEffect(() => {
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

    fetchUser();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const { data } = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const { data } = await response.json();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Don't set error state here to avoid blocking the UI
    }
  };

  const handleCreate = async (data: Product) => {
    try {
      setLoading(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create');
      await fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: Product) => {
    if (!editingProduct) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/products?id=${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update');
      await fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deletion failed');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => { 
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 mt-23">
    <DashboardHeader user={user}/>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des produits</h1>
        <button 
          onClick={() => setEditingProduct({} as Product)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Ajouter un produit
        </button>
      </div>

      {/* Category Manager Component */}
      <CategoryManager 
        categories={categories} 
        onCategoryAdded={fetchCategories} 
      />

      {editingProduct && (
        <NewProductForm
          product={editingProduct}
          onSubmit={editingProduct._id ? handleUpdate : handleCreate}
          onCancel={() => setEditingProduct(null)}
          categories={categories}
        />
      )}

      <ProductTable
        products={products}
        loading={loading}
        onEdit={setEditingProduct}
        onDelete={handleDelete}
        categories={categories}
      />
    </div>
  );
};

export default ProductsPage;