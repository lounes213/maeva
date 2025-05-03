'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Product } from '@/app/types/product';
import { FiUpload, FiX } from 'react-icons/fi';
import CouleursPicker from './createColor';

interface ProductFormProps {
  initialData?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialData?.images || initialData?.imageUrls || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.couleurs || []);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: initialData || {
      name: '',
      reference: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      tissu: '',
      couleurs: [],
      taille: [],
      sold: 0,
      promotion: false,
      promoPrice: 0,
      rating: 0,
      reviewCount: 0
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to avoid memory leaks
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleColorsChange = (colors: string[]) => {
    setSelectedColors(colors);
    setValue('couleurs', colors);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      // Input validation
      if (!data.category || data.category.trim() === '') {
        toast.error('Le champ catégorie est requis.');
        setIsLoading(false);
        return;
      }
      
      if (!data.name || data.name.trim() === '') {
        toast.error('Le nom du produit est requis.');
        setIsLoading(false);
        return;
      }

      // Create FormData object
      const formData = new FormData();

      // Add basic fields
      formData.append('name', data.name);
      formData.append('reference', data.reference || '');
      formData.append('description', data.description || '');
      formData.append('price', data.price.toString());
      formData.append('stock', data.stock.toString());
      formData.append('category', data.category);
      formData.append('tissu', data.tissu || '');
      
      // Handle taille (size) - convert array to string if needed
      if (Array.isArray(data.taille)) {
        formData.append('taille', data.taille.join(','));
      } else {
        formData.append('taille', data.taille || '');
      }
      
      // Handle promotion fields
      formData.append('promotion', data.promotion ? 'true' : 'false');
      if (data.promotion && data.promoPrice) {
        formData.append('promoPrice', data.promoPrice.toString());
      }
      
      // Add other numeric fields
      formData.append('sold', (data.sold || 0).toString());
      formData.append('rating', (data.rating || 0).toString());
      formData.append('reviewCount', (data.reviewCount || 0).toString());
      
      // Add colors
      if (selectedColors && selectedColors.length > 0) {
        selectedColors.forEach(color => {
          formData.append('couleurs', color);
        });
      }

      // Add images
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      // Determine API URL and method
      const url = initialData ? `/api/products?id=${initialData._id}` : '/api/products';
      const method = initialData ? 'PUT' : 'POST';

      // Make API request
      console.log(`Sending ${method} request to ${url}`);
      const response = await fetch(url, {
        method,
        body: formData
      });

      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Erreur lors de l\'enregistrement du produit';
        console.error('API response error:', response.status, errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('API response success:', result);
      
      toast.success(initialData ? 'Produit mis à jour avec succès' : 'Produit créé avec succès');
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement :', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            {...register('name', { required: 'Le nom est requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Référence</label>
          <input
            type="text"
            {...register('reference', { required: 'La référence est requise' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.reference && (
            <p className="mt-1 text-sm text-red-600">{errors.reference.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tissu</label>
          <input
            type="text"
            {...register('tissu')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tailles (séparées par des virgules)</label>
          <input
            type="text"
            {...register('taille')}
            placeholder="XS, S, M, L, XL"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prix</label>
          <input
            type="number"
            step="0.01"
            {...register('price', { required: 'Le prix est requis', min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            {...register('stock', { required: 'Le stock est requis', min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Vendus</label>
          <input
            type="number"
            {...register('sold', { min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('promotion')}
            id="promotion"
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="promotion" className="text-sm font-medium text-gray-700">
            Activer la promotion
          </label>
        </div>

        {watch('promotion') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Prix promotionnel</label>
            <input
              type="number"
              step="0.01"
              {...register('promoPrice', {
                min: { value: 0, message: 'Le prix promotionnel doit être positif' },
                max: { value: watch('price'), message: 'Le prix promotionnel doit être inférieur au prix normal' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.promoPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.promoPrice.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Note moyenne (0-5)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            {...register('rating')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre d'avis</label>
          <input
            type="number"
            min="0"
            {...register('reviewCount')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <CouleursPicker onChange={handleColorsChange} initialColors={selectedColors} />
        {selectedColors.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Couleurs sélectionnées:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedColors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 rounded-full pr-2"
                >
                  <div
                    className="w-6 h-6 rounded-full mr-1"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-600">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
        <div className="grid grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                <div className="relative w-full h-32">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="object-center"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
          <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-indigo-500 transition-colors">
            <FiUpload className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Ajouter des images</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            {...register('category', { required: 'La catégorie est requise' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">-- Sélectionnez une catégorie --</option>
            <option value="vetements">Vêtements</option>
            <option value="accessoires">Accessoires</option>
            <option value="chaussures">Chaussures</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;