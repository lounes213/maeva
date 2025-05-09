// components/admin/collections/editCollection.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { FiX, FiImage, FiTag, FiStar, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

interface EditCollectionModalProps {
  collection: {
    _id: string;
    name: string;
    description: string;
    images?: string[];
    status: string;
    tags: string[];
    isFeatured: boolean;
  };
  onClose: () => void;
  onUpdateSuccess: (updatedCollection: any) => void;
}

export default function EditCollectionModal({
  collection,
  onClose,
  onUpdateSuccess,
}: EditCollectionModalProps) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description);
  const [images, setImages] = useState<string[]>(collection.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [status, setStatus] = useState(collection.status);
  const [isFeatured, setIsFeatured] = useState(collection.isFeatured);
  const [tags, setTags] = useState<string[]>(collection.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Le fichier ${file.name} est trop volumineux. Maximum 5MB`);
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Le type de fichier ${file.type} n'est pas supporté`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newImageFiles = [...imageFiles, ...validFiles];
      setImageFiles(newImageFiles);
      
      // Création des URLs pour la prévisualisation
      const newImageUrls = validFiles.map(file => ({
        url: URL.createObjectURL(file),
        isNew: true
      }));
      
      setImages(prev => [...prev, ...newImageUrls.map(img => img.url)]);
    }
  }, [imageFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.startsWith('blob:')) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [images]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    
    // Si c'est une image existante (pas une URL blob), l'ajouter à la liste de suppression
    if (!imageToRemove.startsWith('blob:')) {
      setImagesToRemove(prev => [...prev, imageToRemove]);
      // Révocation de l'URL si c'est une nouvelle image
      URL.revokeObjectURL(imageToRemove);
    }
    
    // Pour les nouvelles images, supprimer le fichier correspondant
    if (imageToRemove.startsWith('blob:')) {
      const fileIndex = imageFiles.findIndex((_, i) => {
        const fileUrl = URL.createObjectURL(imageFiles[i]);
        URL.revokeObjectURL(fileUrl); // Nettoyage immédiat
        return fileUrl === imageToRemove;
      });
      
      if (fileIndex !== -1) {
        setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('status', status);
      formData.append('isFeatured', String(isFeatured));
      formData.append('tags', tags.join(','));
      
      // Add each new image file
      imageFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });
      
      // Add list of images to remove
      if (imagesToRemove.length > 0) {
        formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
      }

      const response = await fetch(`https://maeva-three.vercel.app/api/collection?id=${collection._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update collection');
      }

      const updatedCollection = await response.json();
      onUpdateSuccess(updatedCollection);
      toast.success('Collection updated successfully!');
    } catch (err: any) {
      console.error('Error updating collection:', err);
      toast.error(err.message || 'Failed to update collection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2">Edit Collection</h2>
        <p className="text-sm text-gray-600 mb-6">
          Update the details of your collection
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Collection Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Collection Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Collection 2023"
              className="h-12"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers about this collection"
              rows={4}
            />
          </div>

          {/* Images Upload */}
          <div className="space-y-2">
            <Label>Collection Images</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <FiImage className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {isDragActive ? (
                    'Drop the images here'
                  ) : (
                    <>
                      Drag and drop images here, or <span className="text-blue-600">click to browse</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You can select multiple images
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Images ({images.length})</p>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 rounded-md overflow-hidden">
                        <Image
                          src={image}
                          alt={`Collection image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              <div className="flex items-center gap-2">
                <FiTag className="w-4 h-4" />
                Tags
              </div>
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tags..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4" />
                  Status
                </div>
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isFeatured">
                <div className="flex items-center gap-2">
                  <FiStar className="w-4 h-4" />
                  Featured Collection
                </div>
              </Label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Switch
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked)}
                />
                <Label htmlFor="isFeatured" className="text-sm">
                  {isFeatured ? 'Featured' : 'Not Featured'}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  Update Collection
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}