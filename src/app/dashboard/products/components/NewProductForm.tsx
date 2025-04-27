'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Product, ProductFormValues } from '@/app/types/product';
import { HexColorPicker } from 'react-colorful';
import CouleursPicker from './createColor';

interface ProductFormProps {
  initialData?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(initialData?.imageUrls || []);
  const [files, setFiles] = useState<File[]>([]);
  const [keepExistingImages, setKeepExistingImages] = useState(true);




   const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ProductFormValues>({
    defaultValues: initialData || {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      tissu: '',
      couleurs: [],
      taille: [],
      sold: 0,
      promotion: false,
      reviews: '',
      deliveryDate: '',
      deliveryAddress: '',
      deliveryStatus: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...previewImages];
    const newFiles = [...files];

    if (index < previewImages.length - files.length) {
      // This is an existing image
      if (!keepExistingImages) {
        newPreviews.splice(index, 1);
        setPreviewImages(newPreviews);
      }
    } else {
      // This is a newly uploaded image
      const fileIndex = index - (previewImages.length - files.length);
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      newFiles.splice(fileIndex, 1);
      setPreviewImages(newPreviews);
      setFiles(newFiles);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    const formData = new FormData();

    // Append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Append images
    files.forEach((file) => {
      formData.append('images', file);
    });

    formData.append('keepExistingImages', keepExistingImages.toString());

    try {
      let response;
      if (initialData?._id) {
        // Update existing product
        response = await fetch(`/api/products?id=${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        // Create new product
        response = await fetch('/api/products', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      toast.success(`Product ${initialData?._id ? 'updated' : 'created'} successfully`);
      reset();
      onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Name*</label>
          <input
            {...register('name', { required: 'Name is required' })}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description*</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price*</label>
          <input
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' },
            })}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
        </div>



     {/* Tissu */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tissu</label>
          <input
            {...register('tissu')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Couleurs */}
       <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Choisir des couleurs</label>
      
     

      <div className="flex items-center space-x-4">
        <div
         className="w-8 h-8 rounded border"
         
        />
       <CouleursPicker onChange={(colors) => setValue('couleurs', colors)}  />

      </div>


    </div>
  

        {/* Tailles */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tailles</label>
          <div className="mt-2 space-x-4">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <label key={size} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={size}
                  {...register('taille')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">{size}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock*</label>
          <input
            {...register('stock', {
              required: 'Stock is required',
              min: { value: 0, message: 'Stock must be positive' },
            })}
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category*</label>
        <input

  {...register('category', { required: 'Category is required' })}
    type="text"
  placeholder="Enter a category"
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
/>

          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Sold */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sold</label>
          <input
            {...register('sold', { min: 0 })}
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Promotion */}
        <div className="flex items-center">
          <input
            {...register('promotion')}
            type="checkbox"
            id="promotion"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="promotion" className="ml-2 block text-sm text-gray-700">
            Promotion
          </label>
        </div>

        {/* Delivery Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Status</label>
          <select
            {...register('deliveryStatus')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select status</option>
            <option value="en attente">en attente</option>
            <option value="expédié">expédié</option>
            <option value="livré">livré</option>
            <option value="annulé">annulé</option>
            <option value="retourné">retourné</option>
          </select>
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
          <input
            {...register('deliveryDate')}
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Delivery Address */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
          <input
            {...register('deliveryAddress')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Reviews */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Reviews</label>
          <textarea
            {...register('reviews')}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Image Upload */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
          
          {initialData?._id && previewImages.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="keepExistingImages"
                  checked={keepExistingImages}
                  onChange={(e) => setKeepExistingImages(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="keepExistingImages" className="ml-2 block text-sm text-gray-700">
                  Keep existing images
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {previewImages.map((src, index) => (
              <div key={index} className="relative group">
                <Image
                  src={src}
                  alt={`Preview ${index}`}
                  width={100}
                  height={100}
                  className="rounded-md object-cover h-24 w-full"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB each)</p>
            </div>
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

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;