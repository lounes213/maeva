import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ColorSelector from './createColor';
import { pagesUploadImages } from './pagesUpload';

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
  imageUrls: string[];
  promotion?: boolean;
  promoPrice?: number;
  sold?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  deliveryStatus?: string;
}

interface UpdateProductFormProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
  categories: string[];
}

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const UpdateProductForm = ({ product, onSuccess, onCancel, categories }: UpdateProductFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Product>(product);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(product.imageUrls || []);

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

  const handleSizeChange = (size: string) => {
    setFormData(prev => {
      const newSizes = prev.taille?.includes(size)
        ? prev.taille.filter(s => s !== size)
        : [...(prev.taille || []), size];
      return { ...prev, taille: newSizes };
    });
  };

  const handleColorChange = (colors: string[]) => {
    setFormData(prev => ({ ...prev, couleurs: colors }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedImages(prev => [...prev, ...newFiles]);

    // Create preview URLs
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First upload any new images
      let allImageUrls = [...(formData.imageUrls || [])];
      
      if (selectedImages.length > 0) {
        try {
          console.log('Uploading new images...');
          const newImageUrls = await pagesUploadImages(selectedImages);
          allImageUrls = [...allImageUrls, ...newImageUrls];
          console.log('All image URLs after upload:', allImageUrls);
        } catch (uploadError: any) {
          console.error('Error uploading images:', uploadError);
          toast.error(`Failed to upload images: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }
      
      // Prepare product data with updated image URLs
      const productData = {
        ...formData,
        imageUrls: allImageUrls
      };
      
      console.log('Submitting product data:', productData);

      // Send the update request
      const response = await fetch(`/api/products?id=${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const data = await response.json();
      console.log('Product updated:', data);

      toast.success('Produit mis à jour avec succès!');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la mise à jour du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom du produit *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Référence *
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Catégorie *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="tissu" className="block text-sm font-medium text-gray-700">
              Tissu
            </label>
            <input
              type="text"
              id="tissu"
              name="tissu"
              value={formData.tissu || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        {/* Pricing and Inventory */}
        <div className="space-y-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Prix *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">DA</span>
              </div>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stock *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="promotion"
              name="promotion"
              checked={formData.promotion || false}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="promotion" className="ml-2 block text-sm text-gray-700">
              En promotion
            </label>
          </div>
          
          {formData.promotion && (
            <div>
              <label htmlFor="promoPrice" className="block text-sm font-medium text-gray-700">
                Prix promotionnel *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">DA</span>
                </div>
                <input
                  type="number"
                  id="promoPrice"
                  name="promoPrice"
                  min="0"
                  max={formData.price}
                  step="0.01"
                  value={formData.promoPrice || 0}
                  onChange={handleChange}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required={formData.promotion}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      {/* Product Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tailles</label>
          <div className="grid grid-cols-3 gap-2">
            {sizeOptions.map((size) => (
              <div key={size} className="flex items-center">
                <input
                  type="checkbox"
                  id={`size-${size}`}
                  checked={formData.taille?.includes(size) || false}
                  onChange={() => handleSizeChange(size)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`size-${size}`} className="ml-2 block text-sm text-gray-700">
                  {size}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Couleurs</label>
          <ColorSelector 
            selectedColors={formData.couleurs || []}
            onChange={handleColorChange}
          />
        </div>
      </div>
      
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col rounded-lg border-2 border-dashed w-full h-32 p-10 group text-center">
            <div className="h-full w-full text-center flex flex-col items-center justify-center">
              <svg className="w-10 h-10 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="pointer-none text-gray-500">Ajouter des images</p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Image Preview */}
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
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </div>
    </form>
  );
};

export default UpdateProductForm; 