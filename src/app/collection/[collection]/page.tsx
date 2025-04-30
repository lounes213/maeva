'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag, Star, Info } from 'lucide-react';
import { useParams } from 'next/navigation';
import { BiSort } from 'react-icons/bi';

// Define the Collection type
interface Collection {
  _id: string;
  name: string;
  description: string;
  image?: string[]; // << change from string to string[]
  status: 'published' | 'draft' | 'archived';
  tags: string[];
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function CollectionDetails() {
  const params = useParams();

  if (!params || typeof params.collection !== 'string') {
    console.error("Invalid or missing 'collection' parameter in route.");
    return <div>Invalid collection ID</div>;
  }

  const collectionId = params.collection;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) {
      setError('Collection ID is missing.');
      setLoading(false);
      return;
    }

    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/collection/${encodeURIComponent(collectionId)}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch collection');
        }

        const data = await response.json();
        setCollection(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-amber-500 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-amber-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-amber-200">
          <div className="flex items-center justify-center mb-6 text-amber-700">
            <Info className="w-12 h-12" />
          </div>
          <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
          <Link 
            href="/collection"
            className="block w-full text-center px-4 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors duration-300"
          >
            Return to Collections
          </Link>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-amber-200">
          <div className="flex items-center justify-center mb-6 text-amber-700">
            <Info className="w-12 h-12" />
          </div>
          <p className="text-center text-gray-700 mb-6 font-medium">Collection not found</p>
          <Link 
            href="/collections"
            className="block w-full text-center px-4 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors duration-300"
          >
            Return to Collections
          </Link>
        </div>
      </div>
    );
  }

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  // Helper function to validate the images
  const hasValidImage = (images?: string[]) => {
    // Ensure it's an array of valid image URLs
    return Array.isArray(images) && images.length > 0 && images.every(img => typeof img === 'string' && img.trim() !== '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/collection" 
            className="inline-flex items-center px-4 py-2 bg-white text-amber-700 rounded-full shadow-sm hover:bg-amber-50 transition-colors duration-300 border border-amber-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Link>
        </div>

        {hasValidImage(collection.image) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-white">
            {collection.image!.map((imgUrl, idx) => (
              <div key={idx} className="relative h-64 w-full overflow-hidden rounded-lg border border-amber-200">
                <Image 
                  src={imgUrl}  // Ensure the imgUrl is valid
                  alt={`${collection.name} Image ${idx + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-6">
            <div className="flex items-center space-x-3 mb-2">
              {collection.isFeatured && (
                <span className="flex items-center bg-white text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(collection.status)}`}>
                {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
          </div>
        )}

        <div className="p-6">
          {collection.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="mr-2 flex items-center text-amber-700">
                <Tag className="w-4 h-4" />
              </div>
              {collection.tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full border border-amber-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {collection.description && (
            <div className="prose max-w-none mb-8 bg-amber-50 p-6 rounded-lg border border-amber-100">
              <p className="text-gray-700">{collection.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-200">
              <h2 className="text-lg font-semibold mb-4 text-amber-800 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Collection Details
              </h2>
              <dl className="space-y-4">
                <div className="flex items-start">
                  <dt className="flex items-center text-sm font-medium text-gray-500 min-w-32">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </dt>
                  <dd className="ml-4 text-gray-700">{new Date(collection.createdAt).toLocaleDateString()}</dd>
                </div>
                
                <div className="flex items-start">
                  <dt className="flex items-center text-sm font-medium text-gray-500 min-w-32">
                    <Clock className="w-4 h-4 mr-2" />
                    Last Updated
                  </dt>
                  <dd className="ml-4 text-gray-700">{new Date(collection.updatedAt).toLocaleDateString()}</dd>
                </div>
                
                <div className="flex items-start">
                  <dt className="flex items-center text-sm font-medium text-gray-500 min-w-32">
                    <BiSort className="w-4 h-4 mr-2" />
                    Sort Order
                  </dt>
                  <dd className="ml-4 text-gray-700">{collection.sortOrder}</dd>
                </div>
              </dl>
            </div>
            
            {Object.keys(collection.metadata || {}).length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-200">
                <h2 className="text-lg font-semibold mb-4 text-amber-800 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Additional Information
                </h2>
                <dl className="space-y-4">
                  {Object.entries(collection.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-start">
                      <dt className="text-sm font-medium text-gray-500 min-w-32">{key}</dt>
                      <dd className="ml-4 text-gray-700 break-words max-w-full">
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
