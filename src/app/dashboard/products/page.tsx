// app/dashboard/products/page.tsx
'use client';
import { useState, useEffect } from 'react';
import ProductTable from './components/ProductTable';
import { Product } from '@/app/types/product';
import NewProductForm from './components/NewProductForm';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div>
      {error && <div className="error">{error}</div>}
      
      <button onClick={() => setEditingProduct({} as Product)}>
        Add New Product
      </button>

      {editingProduct && (
        <NewProductForm
          product={editingProduct}
          onSubmit={editingProduct._id ? handleUpdate : handleCreate}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      <ProductTable
        products={products}
        loading={loading}
        onEdit={setEditingProduct}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProductsPage;