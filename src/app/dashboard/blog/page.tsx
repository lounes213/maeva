'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import DashboardHeader from "@/app/dashboard/components/DashboardHeader";
import { User } from "lucide-react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import CreateBlogForm from "./components/creatBlog";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function BlogAdminPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${window.location.origin}/api/blog`);
      if (!response.ok) throw new Error("Failed to fetch blogs");
      const data = await response.json();
      setBlogs(data.posts || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const response = await fetch(`/api/blog?slug=${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete blog post");

      setBlogs((prev) => prev.filter((b) => b.slug !== slug));
      toast.success("Blog deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleNewBlogCreated = (newBlog: BlogPost) => {
    if (editingBlog) {
      setBlogs((prev) => prev.map(b => b._id === newBlog._id ? newBlog : b));
      toast.success("Blog updated successfully!");
    } else {
      setBlogs((prev) => [newBlog, ...prev]);
      toast.success("Blog created successfully!");
    }
    setShowForm(false);
    setEditingBlog(null);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <DashboardHeader user={User} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Blog Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingBlog(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Create New Blog
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blogs found. Create your first blog post!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {blog.image ? (
                        <div className="relative h-12 w-12 rounded-md overflow-hidden">
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/blog/${blog.slug}`} 
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {blog.title}
                      </Link>
                      {blog.excerpt && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {blog.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(blog.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/blog/${blog.slug}`} 
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          👁️
                        </Link>
                        <button
                          onClick={() => {
                            setEditingBlog(blog);
                            setShowForm(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteBlog(blog.slug)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Blog Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">
                {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBlog(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <CreateBlogForm
                onCreated={handleNewBlogCreated}
                blog={editingBlog}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}