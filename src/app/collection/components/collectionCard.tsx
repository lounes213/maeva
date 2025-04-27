import Image from 'next/image';
import Link from 'next/link';
import { memo, useMemo } from 'react';

interface CollectionCardProps {
  collection: {
    _id: string;
    name: string;
    description?: string;
    image?: string | string[];
    tags?: string[];
    isFeatured?: boolean;
  };
}

const CollectionCard = memo(({ collection }: CollectionCardProps) => {
  // Handle image URL, fallback to an empty string if no image
  const imageUrl = collection.image?.[0] ?? '';

  // Memoize the tag elements to avoid unnecessary re-renders
  const tagElements = useMemo(() => {
    return collection.tags?.map((tag, index) => (
      <span
        key={index}
        className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full"
      >
        {tag}
      </span>
    ));
  }, [collection.tags]);

  return (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all bg-white">
      {imageUrl && (
        <div className="relative h-48 w-full">
          {/* Image Optimization */}
          <Image
            src={imageUrl}
            alt={collection.name}
            layout="fill"
            objectFit="cover"
            priority  // Ensures this image is prioritized
            placeholder="blur"  // Placeholder for image loading
            blurDataURL="data:image/svg+xml;base64,..." // Optional small base64 blur image
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold">{collection.name}</h3>

        {collection.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{collection.description}</p>
        )}

        {collection.tags && collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tagElements}
          </div>
        )}

        {/* Explore Button */}
        <div className="mt-4">
          <Link href={`/collection/${collection._id}`}>
            <p className=" text-black py-2 px-4 rounded-lg hover:bg-amber-600 shadow-amber-300 transition-all">
              Explore Collection
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
});

export default CollectionCard;
