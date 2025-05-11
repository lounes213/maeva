'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { FiUpload, FiX } from 'react-icons/fi';
import CouleursPicker from './createColor';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ProductFormData {
  name: string;
  reference: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  tissu?: string;
  promotion: boolean;
  promoPrice?: string;
}

const NewProductForm: React.FC<ProductFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialData?.images || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.couleurs || []);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductFormData>({
    defaultValues: initialData || {
      name: '',
      reference: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      tissu: '',
      promotion: false,
      promoPrice: '',
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} n'est pas une image valide`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} est trop volumineux (max 5MB)`);
        return false;
      }
      return true;
    });

    setSelectedImages(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [
      ...prev,
      ...validFiles.map(file => URL.createObjectURL(file))
    ]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const onSubmit = async (formData: ProductFormData) => {
    setIsLoading(true);

    try {
      const data = new FormData();
      
      // Add basic fields
      data.append('name', formData.name);
      data.append('reference', formData.reference);
      data.append('description', formData.description);
      data.append('price', formData.price.toString());
      data.append('stock', formData.stock.toString());
      data.append('category', formData.category);
      if (formData.tissu) data.append('tissu', formData.tissu);
      if (selectedColors.length) data.append('couleurs', selectedColors.join(','));
      if (formData.promotion) {
        data.append('promotion', 'true');
        if (formData.promoPrice) data.append('promoPrice', formData.promoPrice.toString());
      }

      // Add images
      selectedImages.forEach(image => {
        data.append('images', image);
      });

      console.log('Submitting form data:', {
        fields: Object.fromEntries(data.entries()),
        images: selectedImages.map(img => ({
          name: img.name,
          size: img.size,
          type: img.type
        }))
      });

      const response = await fetch('/api/products', {
        method: 'POST',
        body: data,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create product');
      }

      toast.success('Product created successfully');
      router.push('/dashboard/products');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message?.toString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reference</label>
          <input
            type="text"
            {...register('reference', { required: 'Reference is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.reference && (
            <p className="mt-1 text-sm text-red-600">{errors.reference.message?.toString()}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message?.toString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            step="0.01"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message?.toString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            {...register('stock', { 
              required: 'Stock is required',
              min: { value: 0, message: 'Stock must be positive' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message?.toString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            {...register('category', { required: 'Category is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message?.toString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tissu</label>
          <input
            type="text"
            {...register('tissu')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Colors</label>
          <CouleursPicker
            onChange={(colors) => setSelectedColors(colors)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        </div>

        {previewUrls.length > 0 && (
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('promotion')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Promotion</label>
          </div>
        </div>

        {watch('promotion') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Promo Price</label>
            <input
              type="number"
              step="0.01"
              {...register('promoPrice', {
                min: { value: 0, message: 'Price must be positive' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.promoPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.promoPrice.message?.toString()}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Enregistrement...' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default NewProductForm;