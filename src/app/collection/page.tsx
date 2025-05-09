import Navigation from "../components/header";
import { headers } from 'next/headers';
import CollectionCard from "./components/collectionCard";

// Function to fetch collections from the API
async function getCollections() {
  const headersList = await headers();
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host');
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`https://maeva-three.vercel.app/api/collection`, {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}

export default async function CollectionsPage() {
  const collections = await getCollections();
  
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Enhanced Hero Section with animated gradient */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white animate-gradient">
        {/* Animated Wave Shape */}
        <svg
          className="absolute top-0 left-0 w-full z-0 transition-transform duration-1000 ease-in-out hover:scale-x-105"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
        >
          <path
            fill="#fff"
            d="M0,64L60,80C120,96,240,128,360,138.7C480,149,600,139,720,122.7C840,107,960,85,1080,96C1200,107,1320,149,1380,170.7L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          />
        </svg>

        {/* Animated Algerian pattern */}
        <div className="absolute inset-0 bg-[url('/images/geometric-pattern.png')] bg-repeat opacity-10 z-0 animate-pattern-move" />

        {/* Glowing Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center transform transition-all duration-300 hover:scale-[1.01]">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight font-serif drop-shadow-md hover:text-shadow-lg transition-all duration-500">
            Nos Collections <span className="text-amber-600 hover:text-amber-700 transition-colors">Exclusives</span>
          </h1>
        </div>
      </div>

      {/* Collections Grid with subtle fade-in */}
      <div className="animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 py-8">
         {collections.length > 0 ? (
  collections
    .filter((collection: { name: any; }) => collection.name) // filter out bad ones
    .map((collection: { _id: any; name?: string; description?: string | undefined; image?: string | string[] | undefined; tags?: string[] | undefined; isFeatured?: boolean | undefined; }) => (
      <CollectionCard key={collection._id} collection={collection as { _id: string; name: string; description?: string; image?: string | string[]; tags?: string[]; isFeatured?: boolean }} />
    ))
) : (
  <div className="col-span-full text-center text-gray-500">
    <p>No collections available at the moment.</p>
  </div>
)}

        </div>
      </div>
    </main>
  );
}
