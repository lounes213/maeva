'use client';

import { useEffect, useState } from 'react';
import CollectionCard from './collectionCard';

interface Collection {
  _id: string;
  name: string;
  description?: string;
  image?: string | string[];
  tags?: string[];
  isFeatured?: boolean;
}

export default function CollectionGrid() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch('/api/collection');
        const data = await res.json();
        setCollections(data.data);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading collections...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {collections.map((collection) => (
        <CollectionCard key={collection._id} collection={collection} />
      ))}
    </div>
  );
}
