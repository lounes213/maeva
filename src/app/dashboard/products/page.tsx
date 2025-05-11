'use client';

import { useState, useEffect, SetStateAction} from 'react';
import { PlusCircle, Filter, Search, RefreshCw } from 'lucide-react';
import ProductTable from './components/ProductTable';
import Modal from './components/modal';
import NewProductForm from './components/NewProductForm';
import UpdateProductForm from './components/updateProduct';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  reference: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tissu?: string;
  couleurs?: string[];
  taille?: string[];
  promotion?: boolean;
  promoPrice?: number;
  imageUrls?: string[];
  sold?: number;
  rating?: number;
  createdAt?: string;
}

const ProductPage = () => {
  // State for product data and UI controls
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [promotionFilter, setPromotionFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch categories (only once)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // This would typically come from a categories API
        // For now, we'll extract unique categories from products
        const response = await fetch('/api/product');
        const data = await response.json();
        
        if (response.ok) {
          const uniqueCategories = Array.from(
            new Set(data.products.map((product: Product) => product.category))
          );
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch products with filters, pagination, and sorting
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string with all filters
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);
      if (categoryFilter) queryParams.append('category', categoryFilter);
      if (promotionFilter) queryParams.append('promotion', promotionFilter);
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);
      
      const response = await fetch(`/api/product?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      setProducts(data.products);
      setTotalPages(data.pagination.pages);
      setTotalProducts(data.pagination.total);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount and when filters/pagination/sorting change
  useEffect(() => {
    fetchProducts();
  }, [page, limit, sortBy, sortOrder, categoryFilter, promotionFilter]);

  // Search products (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 1) {
        setPage(1); // Reset to page 1 when search changes
      } else {
        fetchProducts();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle product creation success
  const handleProductCreated = () => {
    setIsNewModalOpen(false);
    fetchProducts();
    toast.success('Produit créé avec succès');
  };

  // Handle product update success
  const handleProductUpdated = () => {
    setIsUpdateModalOpen(false);
    setCurrentProduct(null);
    fetchProducts();
    toast.success('Produit mis à jour avec succès');
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    try {
      const response = await fetch(`/api/product?id=${currentProduct._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }
      
      setIsDeleteModalOpen(false);
      setCurrentProduct(null);
      fetchProducts();
      toast.success('Produit supprimé avec succès');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression du produit');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Produits</h1>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle size={20} />
          Ajouter un produit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={promotionFilter}
                onChange={(e) => setPromotionFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Tous les produits</option>
                <option value="true">En promotion</option>
                <option value="false">Prix normal</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setPromotionFilter('');
                setPage(1);
                setSortBy('createdAt');
                setSortOrder('desc');
              }}
              className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={16} />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">{error}</div>
      ) : (
        <ProductTable
          products={products}
          loading={loading}
          onEdit={(product: SetStateAction<Product | null>) => {
            setCurrentProduct(product);
            setIsUpdateModalOpen(true);
          }}
          onDelete={(product: SetStateAction<Product | null>) => {
            setCurrentProduct(product);
            setIsDeleteModalOpen(true);
          }}
          page={page}
          limit={limit}
          totalPages={totalPages}
          totalItems={totalProducts}
          onPageChange={setPage}
          onLimitChange={setLimit}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field: SetStateAction<string>) => {
            if (sortBy === field) {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy(field);
              setSortOrder('asc');
            }
          }}
        />
      )}

      {/* New Product Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Ajouter un nouveau produit"
      >
        <NewProductForm 
          onSuccess={handleProductCreated} 
          onCancel={() => setIsNewModalOpen(false)} 
          categories={categories}
        />
      </Modal>

      {/* Update Product Modal */}
      {currentProduct && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setCurrentProduct(null);
          }}
          title={`Modifier: ${currentProduct.name}`}
        >
          <UpdateProductForm
            product={currentProduct}
            onSuccess={handleProductUpdated}
            onCancel={() => {
              setIsUpdateModalOpen(false);
              setCurrentProduct(null);
            }}
            categories={categories}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {currentProduct && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCurrentProduct(null);
          }}
          title="Confirmer la suppression"
        >
          <div className="p-4">
            <p className="mb-4">
              Êtes-vous sûr de vouloir supprimer le produit "{currentProduct.name}" ?
              Cette action ne peut pas être annulée.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCurrentProduct(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductPage;