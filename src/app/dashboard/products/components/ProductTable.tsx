'use client';
import React, { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiEdit, FiTrash2, FiTruck, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Product } from '@/app/types/product';
import ProductForm from './NewProductForm';
import Modal from './modal';

interface ProductTableProps {
  products: Product[];
  refreshProducts: () => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, refreshProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct?._id) {
      toast.error('ID du produit manquant. Impossible de supprimer.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?id=${selectedProduct._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur de suppression:', errorData);
        throw new Error(errorData.message || 'Échec de la suppression du produit');
      }

      toast.success('Produit supprimé avec succès');
      refreshProducts();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erreur de suppression:', error);

      if (error instanceof Error) {
        toast.error(error.message || 'Une erreur est survenue lors de la suppression du produit');
      } else {
        toast.error('Une erreur inconnue est survenue lors de la suppression du produit');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDeliveryStatusStyle = (status: string) => {
    switch (status) {
      case 'en attente':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock className="text-sm" /> };
      case 'expédié':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiTruck className="text-sm" /> };
      case 'livré':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle className="text-sm" /> };
      case 'annulé':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <FiXCircle className="text-sm" /> };
      case 'retourné':
        return { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FiAlertCircle className="text-sm" /> };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', icon: <FiAlertCircle className="text-sm" /> };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-sm text-gray-600">
          <tr>
            <th className="py-3 px-4 text-left">Image</th>
            <th className="py-3 px-4 text-left">Nom</th>
            <th className="py-3 px-4 text-left">Prix</th>
            <th className="py-3 px-4 text-left">Stock</th>
            <th className="py-3 px-4 text-left">Vendu</th>
            <th className="py-3 px-4 text-left">Catégorie</th>
            <th className="py-3 px-4 text-left">Tissu</th>
            <th className="py-3 px-4 text-left">Couleurs</th>
            <th className="py-3 px-4 text-left">Tailles</th>
            <th className="py-3 px-4 text-left">Promotion</th>
            <th className="py-3 px-4 text-left">Date Livraison</th>
            <th className="py-3 px-4 text-left">Statut Livraison</th>
            <th className="py-3 px-4 text-left">Créé le</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {products.map((product) => {
            const statusStyle = getDeliveryStatusStyle(product.deliveryStatus || '');
            
            return (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  {product.imageUrls?.[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Aucune image</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-gray-500 text-xs line-clamp-1">{product.description}</div>
                </td>
                <td className="py-3 px-4">{product.price.toFixed(2)}€</td>
                <td className="py-3 px-4">{product.stock}</td>
                <td className="py-3 px-4">{product.sold ?? 0}</td>
                <td className="py-3 px-4 capitalize">{product.category}</td>
                <td className="py-3 px-4 capitalize">{product.tissu || '—'}</td>
                <td className="py-3 px-4">
                  {product.couleurs?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {product.couleurs.map((color, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 text-xs rounded capitalize"
                          style={{ backgroundColor: `${color}20`, color: color }}
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  {product.taille?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {product.taille.map((size, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 text-xs bg-gray-100 rounded"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  {product.promotion ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Oui</span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">Non</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {product.deliveryDate
                    ? new Date(product.deliveryDate).toLocaleDateString('fr-FR')
                    : '—'}
                </td>
                <td className="py-3 px-4 capitalize">
                  {product.deliveryStatus ? (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.icon}
                      {product.deliveryStatus}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString('fr-FR')
                    : '—'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Modifier"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Supprimer"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier le produit"
      >
        <ProductForm
          initialData={selectedProduct}
          onSuccess={() => {
            refreshProducts();
            setIsEditModalOpen(false);
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p>
            Êtes-vous sûr de vouloir supprimer <strong>{selectedProduct?.name}</strong> ? Cette action
            est irréversible.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border rounded-md"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
              disabled={isLoading}
            >
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductTable;