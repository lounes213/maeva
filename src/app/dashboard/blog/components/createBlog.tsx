'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';

export default function CreateBlogModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: null as File | null,
    author: '',
    category: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          data.append('tags', JSON.stringify(value.split(',').map((tag: string) => tag.trim())));
        } else if (key === 'image' && value) {
          data.append('image', value);
        } else if (value && typeof value !== 'object') {
          data.append(key, value);
        }
      });

      const res = await fetch('/api/blog', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Failed to create blog');
      alert('Blog created!');
      setOpen(false);
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        image: null,
        author: '',
        category: '',
        tags: '',
      });
      setPreview(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" /> New Blog
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Blog Post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
          <Input name="slug" placeholder="Slug" value={formData.slug} onChange={handleChange} />
          <Textarea name="content" placeholder="Content" value={formData.content} onChange={handleChange} />
          <Textarea name="excerpt" placeholder="Excerpt" value={formData.excerpt} onChange={handleChange} />
          <Input name="author" placeholder="Author" value={formData.author} onChange={handleChange} />
          <Input name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
          <Input name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleChange} />

          <div>
            <label className="block text-sm mb-1">Upload Image</label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && <img src={preview} alt="Preview" className="mt-2 w-32 rounded-md" />}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
