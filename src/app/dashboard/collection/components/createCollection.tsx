'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { FiX, FiImage, FiTag, FiStar, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog';
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

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Image component
function SortableImage({ id, src, index, removeImage }: { id: string; src: string; index: number; removeImage: (index: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative w-24 h-24 rounded-md overflow-hidden group cursor-move"
    >
      <Image
        src={src}
        alt={`Preview ${index}`}
        fill
        style={{ objectFit: 'cover' }}
      />
      <button
        type="button"
        onClick={() => removeImage(index)}
        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition-all opacity-80 group-hover:opacity-100"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );
}


export default function CreateCollectionModal({ onCreateSuccess}:any) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [preview, setPreview] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    images: [] as File[],
    status: 'draft',
    isFeatured: false,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setForm(prev => ({ ...prev, images: [...prev.images, ...acceptedFiles] }));
      const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
      setPreview(prev => [...prev, ...newPreviews]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

 const handleSubmit = async () => {
  if (!form.name.trim()) {
    toast.error('Collection name is required');
    return;
  }

  setIsLoading(true);
  
  try {
    // Upload images to Cloudinary first
    let imageUrls: string[] = [];
    if (form.images.length > 0) {
      const uploadToast = toast.loading('Téléchargement des images en cours...');
      try {
        const { uploadMultipleToCloudinary } = await import('@/lib/cloudinary');
        imageUrls = await uploadMultipleToCloudinary(form.images);
        
        if (imageUrls.length === 0 && form.images.length > 0) {
          toast.error('Toutes les images ont échoué au téléchargement. Veuillez réessayer.');
          toast.dismiss(uploadToast);
          setIsLoading(false);
          return;
        }
        
        toast.success(`${imageUrls.length} image(s) téléchargée(s) avec succès`, {
          id: uploadToast
        });
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Erreur lors du téléchargement des images', {
          id: uploadToast
        });
        setIsLoading(false);
        return;
      }
    }
    
    // Prepare collection data
    const collectionData = {
      name: form.name,
      description: form.description,
      status: form.status,
      isFeatured: form.isFeatured,
      tags: tags.length > 0 ? tags : [],
      images: imageUrls
    };

    // Send to API
    const res = await fetch('/api/collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collectionData),
    });

    if (!res.ok) {
      throw new Error('Failed to create collection');
    }

    const data = await res.json();
    toast.success('Collection created successfully!');
    
    if (onCreateSuccess) {
      onCreateSuccess(data); // Call the parent function
    }
    
    resetForm();
    setOpen(false);
    return data;
  } catch (error) {
    console.error('Error creating collection:', error);
    toast.error('Failed to create collection');
  } finally {
    setIsLoading(false);
  }
};


  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      images: [],
      status: 'draft',
      isFeatured: false,
    });
    setTags([]);
    setTagInput('');
    setPreview([]);
  };

  // Sensors for DnD Kit
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FiCheckCircle className="w-4 h-4" />
          Create Collection
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">New Collection</DialogTitle>
          <DialogDescription>
            Organize products into curated collections for your store
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Collection Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Collection Name *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Summer Collection 2023"
              className="h-12"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell customers about this collection"
              rows={4}
            />
          </div>

          {/* Image Upload */}
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
                  Recommended size: 800x800px (1:1 ratio)
                </p>
              </div>
            </div>

            {/* Sortable Preview Images */}
            {preview.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                  const { active, over } = event;
                  if (active.id !== over?.id) {
                    const oldIndex = preview.findIndex((_, i) => i.toString() === active.id);
                    const newIndex = preview.findIndex((_, i) => i.toString() === over?.id);
                    
                    setPreview((prev) => arrayMove(prev, oldIndex, newIndex));
                    setForm((prev) => ({
                      ...prev,
                      images: arrayMove(prev.images, oldIndex, newIndex),
                    }));
                  }
                }}
              >
                <SortableContext
                  items={preview.map((_, index) => index.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-wrap gap-4 mt-4">
                    {preview.map((src, index) => (
                      <SortableImage key={index} id={index.toString()} src={src} index={index} removeImage={removeImage} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
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
                value={form.status}
                onValueChange={(value: any) => setForm(prev => ({ ...prev, status: value }))}
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
                  checked={form.isFeatured}
                  onCheckedChange={(checked: any) => setForm(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label htmlFor="isFeatured" className="text-sm">
                  {form.isFeatured ? 'Featured' : 'Not Featured'}
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !form.name.trim()}
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
                Creating...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" />
                Create Collection
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
