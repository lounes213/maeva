'use client';
import { Product } from '@/app/types/product';
import { useState } from 'react';
import ProductTable from './components/ProductTable';
import UpdateProductForm from './components/UpdateProductForm';


const ProductsPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  // Add other necessary state variables (pagination, sorting, etc.)

  // Fetch products function (example)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Edit handler
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Delete handler
  const handleDelete = async (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/products?id=${selectedProduct._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh the products list
      await fetchProducts();
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update success handler
  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    fetchProducts(); // Refresh the list
  };

  return (
    <div>
      <ProductTable
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        // Add other required props...
        page={1}
        limit={10}
        totalPages={5}
        totalItems={50}
        onPageChange={(page) => console.log('Page changed:', page)}
        onLimitChange={(limit) => console.log('Limit changed:', limit)}
        sortBy="name"
        sortOrder="asc"
        onSort={(field) => console.log('Sort by:', field)}
        categories={['Category1', 'Category2']}
      />

      {/* Edit Modal */}
      {isEditModalOpen && selectedProduct && (
        <UpdateProductForm
          product={selectedProduct}
          onSuccess={handleUpdateSuccess}
          onCancel={() => setIsEditModalOpen(false)}
          categories={['Category1', 'Category2']}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete "{selectedProduct.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;