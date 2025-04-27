import { IBlogPost } from "@/app/types/blog";
import { useRouter } from "next/navigation";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, useEffect, useState } from "react";

export function BlogList() {
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/blog');
      const data = await res.json();
      setPosts(data.posts);
      setLoading(false);
    };
    fetchPosts();
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
  </div>
))}

    </div>
  );
}