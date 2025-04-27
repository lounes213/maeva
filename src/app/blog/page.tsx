'use client';

import { useEffect, useState } from 'react';
import Header from '../components/header';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  content?: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blog');
        const data = await res.json();
        if (Array.isArray(data.posts)) {
          setBlogs(data.posts);
          setFilteredBlogs(data.posts);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = blogs;

    if (search) {
      const keyword = search.toLowerCase();
      filtered = filtered.filter((blog) =>
        blog.title.toLowerCase().includes(keyword) ||
        blog.excerpt?.toLowerCase().includes(keyword)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((blog) => blog.category === selectedCategory);
    }

    if (selectedTag) {
      filtered = filtered.filter((blog) => blog.tags?.includes(selectedTag));
    }

    setFilteredBlogs(filtered);
  }, [search, selectedCategory, selectedTag, blogs]);

  const allCategories = [...new Set(blogs.map((blog) => blog.category).filter(Boolean))];
  const allTags = [...new Set(blogs.flatMap((blog) => blog.tags || []))];

  return (
  <>
  <Header />
  <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
    <h1 className="text-4xl font-bold mb-10 text-gray-800 dark:text-white">Latest Blog Posts</h1>

    <div className="flex flex-col lg:flex-row gap-10">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 space-y-8">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Categories</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <button
                className={`hover:text-blue-600 transition ${
                  !selectedCategory ? 'text-blue-600 font-semibold' : ''
                }`}
                onClick={() => setSelectedCategory('')}
              >
                All
              </button>
            </li>
            {allCategories.map((cat) => (
              <li key={cat}>
                <button
                  className={`hover:text-blue-600 transition ${
                    selectedCategory === cat ? 'text-blue-600 font-semibold' : ''
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Tags</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                !selectedTag
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedTag === tag
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setSearch('');
            setSelectedCategory('');
            setSelectedTag('');
          }}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white mt-4 underline"
        >
          Reset filters
        </button>
      </aside>

      {/* Blog Grid */}
      <section className="flex-1">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredBlogs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No blog posts found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(blog.createdAt).toLocaleDateString()} • {blog.category}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                    {blog.excerpt || blog.content?.slice(0, 120)}...
                  </p>
                  <a
                    href={`/blog/${blog.slug}`}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Read more →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  </main>
</>

  );
}
