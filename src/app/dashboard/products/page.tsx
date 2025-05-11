'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductTable from './components/ProductTable';
import NewProductForm from './components/NewProductForm';
import { Product } from '@/app/types/product';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        
        setProducts(productsData.data);
        setCategories(categoriesData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to refresh products');
      const data = await response.json();
      setProducts(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            Actualiser
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Produit
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun produit trouvé</p>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="mt-4"
          >
            Créer un nouveau produit
          </Button>
        </div>
      ) : (
        <ProductTable 
            products={products}
            categories={categories} loading={false} onEdit={function (product: Product): void {
              throw new Error('Function not implemented.');
            } } onDelete={function (product: Product): void {
              throw new Error('Function not implemented.');
            } } page={0} limit={0} totalPages={0} totalItems={0} onPageChange={function (page: number): void {
              throw new Error('Function not implemented.');
            } } onLimitChange={function (limit: number): void {
              throw new Error('Function not implemented.');
            } } sortBy={''} sortOrder={''} onSort={function (field: string): void {
              throw new Error('Function not implemented.');
            } }        />
      )}

      {/* New Product Form Modal */}
      {isFormOpen && (
        <NewProductForm 
          categories={categories} 
          onClose={() => {
            setIsFormOpen(false);
            handleRefresh();
          }} 
        />
      )}
    </div>
  );
}