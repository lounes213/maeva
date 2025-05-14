"use client";

import { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import slugify from "@/lib/utils";

interface FormDataState {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  images: File[];
}

interface CreateBlogFormProps {
  blog?: any;
  onCreated?: (blog: any) => void;
  onEdited?: (blog: any) => void;
}

export default function CreateBlogForm({ blog, onCreated, onEdited }: CreateBlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    content: "",
    excerpt: "",
    category: "Uncategorized",
    tags: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        category: blog.category || "Uncategorized",
        tags: blog.tags || "",
        images: [],
      });

      if (blog.imageUrls?.length) {
        setImagePreviews(blog.imageUrls);
      }
    }
  }, [blog]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);
    const newPreviews: string[] = [];

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...selectedFiles] }));
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...formData.images];
    const updatedPreviews = [...imagePreviews];
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setFormData((prev) => ({ ...prev, images: updatedImages }));
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!formData.title || !formData.content) {
        throw new Error("Title and content are required");
      }

      // Upload images to Cloudinary first
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        const uploadToast = toast.loading('Téléchargement des images en cours...');
        try {
          const { uploadMultipleToCloudinary } = await import('@/lib/cloudinary');
          imageUrls = await uploadMultipleToCloudinary(formData.images);
          
          if (imageUrls.length === 0 && formData.images.length > 0) {
            toast.error('Toutes les images ont échoué au téléchargement. Veuillez réessayer.');
            toast.dismiss(uploadToast);
            setIsSubmitting(false);
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
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data for API
      const blogData = {
        title: formData.title,
        content: formData.content,
        slug: slugify(formData.title),
        excerpt: formData.excerpt || "",
        category: formData.category || "Uncategorized",
        tags: formData.tags || "",
        imageUrls: imageUrls
      };

      const method = blog ? "PUT" : "POST";
      const url = blog ? `/api/blog?slug=${blog.slug}` : "/api/blog";

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save blog post");
      }

      const result = await response.json();
      setSuccessMessage(blog ? "Blog post updated!" : "Blog post created!");

      if (!blog) {
        setFormData({
          title: "",
          content: "",
          excerpt: "",
          category: "Uncategorized",
          tags: "",
          images: [],
        });
        setImagePreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      if (blog && onEdited) onEdited(result);
      if (!blog && onCreated) onCreated(result);

      setTimeout(() => {
        router.push("/dashboard/blog");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {blog ? "Edit Blog Post" : "Create New Blog Post"}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Content */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={12}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Excerpt */}
        <div className="mb-4">
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt (max 200 characters)
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/200 characters</p>
        </div>

        {/* Category and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Uncategorized">Uncategorized</option>
              <option value="Technology">Technology</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Health">Health</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Business">Business</option>
              <option value="Finance">Finance</option>
              <option value="News">News</option>
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="tag1, tag2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Images */}
        <div className="mb-6">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
            Featured Images
          </label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            ref={fileInputRef}
            onChange={handleImagesChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          {/* Preview Grid */}
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <div className="relative h-32 w-full rounded-md overflow-hidden">
                    <Image 
                      src={src} 
                      alt={`preview-${index}`} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting
              ? blog
                ? "Updating..."
                : "Creating..."
              : blog
              ? "Update Post"
              : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
