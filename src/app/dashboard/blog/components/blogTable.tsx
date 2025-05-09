'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogTable() {
  const [blogs, setBlogs] = useState<any[]>([]);

  const fetchBlogs = async () => {
    const res = await fetch('/api/blog');
    const data = await res.json();
    setBlogs(data);
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    fetchBlogs(); // refresh
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">All Blog Posts</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Author</th>
              <th className="p-2">Category</th>
              <th className="p-2">Views</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{blog.title}</td>
                <td className="p-2">{blog.author}</td>
                <td className="p-2">{blog.category}</td>
                <td className="p-2">{blog.viewCount}</td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => alert('Edit modal or page')}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteBlog(blog._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
