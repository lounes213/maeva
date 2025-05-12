'use client';
import React, { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiEdit, FiTrash2, FiTruck, FiXCircle, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Product } from '@/app/types/product';
import ProductForm from './NewProductForm';
import Modal from './modal';
import Image from 'next/image';
import { FiEdit2, FiEye } from 'react-icons/fi';

interface ProductTableProps {
  products: Product[];
  refreshProducts: () => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, refreshProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produit
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendus
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Promotion
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avis
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => (
            <tr 
              key={product._id}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover object-center"
                      />
                    ) : (
                      <Image
                        src="/images/image1.jpg" // Utilisation d'une image existante comme image par défaut
                        alt="Image par défaut"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover object-center"
                      />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.reference}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-900 font-medium">
                    {formatPrice(product.price)}
                  </span>
                  {product.promotion && product.promoPrice && (
                    <span className="text-xs text-red-600">
                      Promo: {formatPrice(product.promoPrice)}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.stock > 10 
                    ? 'bg-green-100 text-green-800'
                    : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock} en stock
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {product.sold || 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  product.promotion
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.promotion ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < (product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    ({product.reviews ? JSON.parse(product.reviews).length : 0})
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <button 
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => handleView(product)}
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => handleEdit(product)}
                  >
                    <FiEdit2 className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(product)}
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Détails du produit"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <div className="grid grid-cols-2 gap-2">
                {selectedProduct.images?.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image}
                      alt={`${selectedProduct.name} - image ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-sm text-gray-500">Référence</span>
                <p className="font-medium">{selectedProduct.reference}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Catégorie</span>
                <p className="font-medium">{selectedProduct.category}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Prix</span>
                <p className="font-medium">{formatPrice(selectedProduct.price)}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Prix promotionnel</span>
                <p className="font-medium">
                  {selectedProduct.promotion && selectedProduct.promoPrice
                    ? formatPrice(selectedProduct.promoPrice)
                    : 'Pas de promotion'}
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Stock</span>
                <p className={`font-medium ${
                  selectedProduct.stock > 10 
                    ? 'text-green-600'
                    : selectedProduct.stock > 0 
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {selectedProduct.stock} unités
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Vendus</span>
                <p className="font-medium">{selectedProduct.sold || 0} unités</p>
              </div>

              <div className="col-span-2">
                <span className="text-sm text-gray-500">Note moyenne</span>
                <div className="flex items-center">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < (selectedProduct.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    ({selectedProduct.rating?.toFixed(1) || '0'}/5) • {selectedProduct.reviewCount || 0} avis
                  </span>
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-sm text-gray-500">Description</span>
                <p className="mt-1 text-gray-700">{selectedProduct.description}</p>
              </div>

              {selectedProduct.tissu && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">Tissu</span>
                  <p className="font-medium">{selectedProduct.tissu}</p>
                </div>
              )}

              {selectedProduct.couleurs && selectedProduct.couleurs.length > 0 && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">Couleurs disponibles</span>
                  <div className="flex gap-2 mt-1">
                    {selectedProduct.couleurs.map((couleur, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: couleur }}
                        title={couleur}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.taille && selectedProduct.taille.length > 0 && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">Tailles disponibles</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProduct.taille.map((taille, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm bg-gray-100 rounded"
                      >
                        {taille}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

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