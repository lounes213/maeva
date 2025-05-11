'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import ColorSelector from './createColor';

interface NewProductFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
  categories: string[];
}

const initialProductState = {
  name: '',
  reference: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  tissu: '',
  couleurs: [] as string[],
  taille: [] as string[],
  promotion: false,
  promoPrice: 0,
  imageUrls: [] as string[],
};

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const NewProductForm = ({ onSuccess, onCancel, categories }: NewProductFormProps) => {
  const [product, setProduct] = useState(initialProductState);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'stock' || name === 'promoPrice') {
      setProduct((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSizeChange = (size: string) => {
    setProduct((prev) => {
      const newSizes = prev.taille.includes(size)
        ? prev.taille.filter((s) => s !== size)
        : [...prev.taille, size];
      return { ...prev, taille: newSizes };
    });
  };

  const handleColorChange = (colors: string[]) => {
    setProduct((prev) => ({ ...prev, couleurs: colors }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      
      const data = await response.json();
      return data.urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Veuillez entrer un nom de catégorie');
      return;
    }

    setAddingCategory(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add category');
      }

      if (data.success) {
        setProduct(prev => ({ ...prev, category: newCategory.trim() }));
        setNewCategory('');
        setShowNewCategoryInput(false);
        toast.success('Catégorie ajoutée avec succès');
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout de la catégorie');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form
      if (!product.name || !product.reference || !product.description || 
          product.price <= 0 || !product.category) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        setLoading(false);
        return;
      }
      
      // Check promotion price if promotion is enabled
      if (product.promotion && (product.promoPrice <= 0 || product.promoPrice >= product.price)) {
        toast.error('Le prix promotionnel doit être supérieur à 0 et inférieur au prix normal');
        setLoading(false);
        return;
      }
      
      // Upload images if any
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        try {
          imageUrls = await uploadImages();
        } catch (error) {
          toast.error('Échec du téléchargement des images');
          setLoading(false);
          return;
        }
      }
      
      // Create product with image URLs
      const productData = {
        ...product,
        imageUrls: imageUrls.length > 0 ? imageUrls : product.imageUrls,
      };
      
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }
      
      toast.success('Produit créé avec succès');
      setProduct(initialProductState);
      setImageFiles([]);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
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
              value={product.name}
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
              value={product.reference}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Catégorie *
            </label>
            <div className="mt-1">
              {!showNewCategoryInput ? (
                <div className="flex gap-2">
                  <select
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    title="Ajouter une nouvelle catégorie"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nouvelle catégorie"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={addingCategory}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={addingCategory || !newCategory.trim()}
                  >
                    {addingCategory ? 'Ajout...' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategory('');
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={addingCategory}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="tissu" className="block text-sm font-medium text-gray-700">
              Tissu
            </label>
            <input
              type="text"
              id="tissu"
              name="tissu"
              value={product.tissu}
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
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={product.price}
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
              value={product.stock}
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
              checked={product.promotion}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="promotion" className="ml-2 block text-sm text-gray-700">
              En promotion
            </label>
          </div>
          
          {product.promotion && (
            <div>
              <label htmlFor="promoPrice" className="block text-sm font-medium text-gray-700">
                Prix promotionnel *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  id="promoPrice"
                  name="promoPrice"
                  min="0"
                  max={product.price}
                  step="0.01"
                  value={product.promoPrice}
                  onChange={handleChange}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required={product.promotion}
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
          value={product.description}
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
                  checked={product.taille.includes(size)}
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
            selectedColors={product.couleurs}
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
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Image Preview */}
        {imageFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
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
          {loading ? 'Création...' : 'Créer le produit'}
        </button>
      </div>
    </form>
  );
};

export default NewProductForm;