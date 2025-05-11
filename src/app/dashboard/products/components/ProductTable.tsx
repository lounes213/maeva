'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Plus } from 'lucide-react';
import NewProductForm from './NewProductForm';
import UpdateProductForm from './UpdateProductForm';
import { Product } from '@/app/types/product';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  page?: number;
  limit?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  sortBy?: string;
  sortOrder?: string;
  onSort?: (field: string) => void;
  categories?: string[];
}

const ProductTable = ({
  products,
  loading,
  onEdit,
  onDelete,
  page = 1,
  limit = 10,
  totalPages = 1,
  totalItems = 0,
  onPageChange = () => {},
  onLimitChange = () => {},
  sortBy = '',
  sortOrder = 'asc',
  onSort = () => {},
  categories = []
}: ProductTableProps) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
                </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('name')}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('reference')}
            >
              Reference {sortBy === 'reference' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('price')}
            >
              Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('stock')}
            >
              Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('category')}
            >
              Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => (
            <tr key={product._id || `product-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                    className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded"></div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{product.reference}</div>
                  </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {product.promotion && product.promoPrice ? (
                    <>
                      <span className="line-through text-gray-500">{product.price} DA</span>
                      <span className="ml-2 text-red-600">{product.promoPrice} DA</span>
                    </>
                  ) : (
                    `${product.price} DA`
                  )}
                </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.stock}</div>
                  </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                  onClick={() => onEdit(product)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                  <Edit className="w-5 h-5" />
                      </button>
                      <button
                  onClick={() => product._id && onDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                  <Trash2 className="w-5 h-5" />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
            Previous
            </button>
            <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
            Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                Previous
                </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pageNum === page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                  {pageNum}
                </button>
              ))}
                <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                Next
                </button>
              </nav>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProductTable;