"use client";

import { IBlogPost } from "@/app/types/blog";
import { fetchBlogPosts, deleteBlogPost } from "@/lib/api";
import { extractBlogPostsFromResponse } from "@/types/blog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";

export function BlogList() {
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchBlogPosts();
      if (response.success) {
        // Use our helper function to safely extract posts from any response format
        const extractedPosts = extractBlogPostsFromResponse(response);
        setPosts(extractedPosts);
      } else {
        throw new Error(response.message || 'Failed to fetch blog posts');
      }
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      setError(error.message || 'Failed to fetch blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const response = await deleteBlogPost(slug);
      if (response.success) {
        // Post was deleted successfully
        await refreshPosts();
      } else {
        throw new Error(response.message || 'Failed to delete post');
      }
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      alert(`Error: ${error.message || 'Failed to delete post'}`);
    }
  };

  const handleEdit = (slug: string) => {
    router.push(`/blog/edit/${slug}`);
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <button 
          onClick={() => router.push('/blog/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Create New Post
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
          <button 
            onClick={refreshPosts}
            className="mt-2 text-blue-600 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blog posts found</p>
          <button 
            onClick={() => router.push('/blog/create')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Create your first post
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <div key={post._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                {post.image && (
                  <div className="md:w-1/4">
                    <Image 
                      src={post.image} 
                      alt={post.title}
                      className="h-48 w-full object-cover" 
                    />
                  </div>
                )}
                <div className={`p-4 ${post.image ? 'md:w-3/4' : 'w-full'}`}>
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(post.createdAt).toLocaleDateString()} • {post.category || 'Uncategorized'}
                  </p>
                  <p className="mt-2 text-gray-700">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags?.map((tag: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button 
                      onClick={() => router.push(`/blog/${post.slug}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Read More
                    </button>
                    <button 
                      onClick={() => handleEdit(post.slug)}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(post.slug)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}