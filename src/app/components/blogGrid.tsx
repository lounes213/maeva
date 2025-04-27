'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
}

export default function BlogGrid() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blog');
        const data = await res.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Chargement des articles...</p>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white border rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
        >
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4 flex flex-col flex-grow">
            <h2 className="text-lg font-semibold text-gray-800">{post.title}</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-3">{post.excerpt}</p>
            <div className="text-xs text-gray-400 mt-2">
              {new Date(post.createdAt).toLocaleDateString('fr-FR')}
            </div>
            <div className="mt-auto">
              <Link
                href={`/blog/${post.slug}`}
                className="inline-block mt-4 text-indigo-600 hover:underline text-sm font-medium"
              >
                Lire l'article →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
