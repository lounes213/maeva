'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import ColorSelector from './createColor';
import { Product } from '@/app/types/product';

interface NewProductFormProps {
  product: Product;
  onSubmit: (data: Product) => void;
  onCancel: () => void;
  categories?: string[];
}

export default function NewProductForm({ product, onSubmit, onCancel, categories = [] }: NewProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Product, '_id'>>({
    name: product.name || '',
    reference: product.reference || '',
    description: product.description || '',
    price: product.price || 0,
    stock: product.stock || 0,
    category: product.category || '',
    tissu: product.tissu || '',
    couleurs: product.couleurs || [],
    taille: product.taille || [],
    promotion: product.promotion || false,
    promoPrice: product.promoPrice || 0,
    imageUrls: product.imageUrls || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'stock' || name === 'promoPrice') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleColorChange = (colors: string[]) => {
    setFormData(prev => ({ ...prev, couleurs: colors }));
  };

  const handleSizeChange = (size: string) => {
    setFormData(prev => {
      const newSizes = prev.taille?.includes(size)
        ? prev.taille.filter(s => s !== size)
        : [...(prev.taille || []), size];
      return { ...prev, taille: newSizes };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index: number) => {
    const newSelectedImages = [...selectedImages];
    const newPreviewUrls = [...previewUrls];
    
    newSelectedImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setSelectedImages(newSelectedImages);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // First upload images if any
      let imageUrls = [...(formData.imageUrls || [])];
      
      if (selectedImages.length > 0) {
        const uploadFormData = new FormData();
        selectedImages.forEach(file => {
          uploadFormData.append('files', file);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images');
        }

        const uploadedUrls = await uploadResponse.json();
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Then create the product with all data
      const productData = {
        ...formData,
        _id: product._id, // Preserve the _id if it exists
        imageUrls,
        price: parseFloat(formData.price.toString()),
        stock: parseFloat(formData.stock.toString()),
        promoPrice: formData.promotion ? parseFloat((formData.promoPrice || 0).toString()) : undefined,
      };

      // Use the onSubmit prop to handle the form submission
      await onSubmit(productData as Product);
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Nouveau Produit" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Informations de base</h4>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom du produit*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                Référence*
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Catégorie*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Prix et Stock</h4>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Prix (€)*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock*
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="promotion"
                name="promotion"
                checked={formData.promotion}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="promotion" className="ml-2 block text-sm text-gray-700">
                En promotion
              </label>
            </div>

            {formData.promotion && (
              <div>
                <label htmlFor="promoPrice" className="block text-sm font-medium text-gray-700">
                  Prix promotionnel (€)*
                </label>
                <input
                  type="number"
                  id="promoPrice"
                  name="promoPrice"
                  value={formData.promoPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  max={formData.price}
                  required={formData.promotion}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Variantes</h4>
            
            <div>
              <label htmlFor="tissu" className="block text-sm font-medium text-gray-700">
                Tissu
              </label>
              <input
                type="text"
                id="tissu"
                name="tissu"
                value={formData.tissu}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleurs disponibles
              </label>
              <ColorSelector
                selectedColors={formData.couleurs || []}
                onChange={handleColorChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tailles disponibles
              </label>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <label key={size} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={size}
                      checked={formData.taille?.includes(size) || false}
                      onChange={() => handleSizeChange(size)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Images</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Images du produit
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Uploader des fichiers</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                </div>
              </div>
              
              {/* Image previews */}
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le produit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}