import { IBlogPost } from "@/app/types/blog";
import { useRouter } from "next/navigation";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, useEffect, useState } from "react";

const API_BASE_URL = 'https://maeva-three.vercel.app';

export function BlogList() {
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPosts(data.data);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog?slug=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await refreshPosts();
      } else {
        throw new Error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button 
        onClick={() => router.push('/blog/create')}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create New Post
      </button>
      
      {posts.map((post) => (
        <div key={post._id} className="border-b pb-6 mb-6">
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <p>{post.excerpt}</p>
          <button 
            onClick={() => router.push(`/blog/${post.slug}`)}
            className="mt-2 text-blue-500"
          >
            Read More
          </button>
          <button 
            onClick={() => handleDelete(post.slug)}
            className="mt-2 text-red-500"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}