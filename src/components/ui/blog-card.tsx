'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BlogCardProps {
  blog: {
    _id: string;
    title: string;
    content?: string;
    image?: string;
    author?: string;
    createdAt: string;
    readTime?: number;
    category?: string;
  };
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export function BlogCard({ blog, variant = 'default', className = '' }: BlogCardProps) {
  // Format the date to "il y a X jours/heures"
  const formattedDate = formatDistanceToNow(new Date(blog.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  // Extract a short excerpt from the content
  const excerpt = blog.content 
    ? blog.content.replace(/<[^>]*>/g, '').slice(0, variant === 'compact' ? 60 : 120) + '...'
    : '';

  // Determine the appropriate classes based on the variant
  const cardClasses = {
    default: 'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group',
    featured: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover-lift',
    compact: 'bg-white rounded-lg shadow-sm hover:shadow transition-all duration-300 overflow-hidden flex',
  };

  return (
    <Link 
      href={`/blog/${blog._id}`}
      className={`${cardClasses[variant]} ${className}`}
    >
      {variant === 'compact' ? (
        // Compact layout (horizontal)
        <>
          <div className="relative w-24 h-24 flex-shrink-0">
            {blog.image ? (
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 96px"
              />
            ) : (
              <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-xl">M</span>
              </div>
            )}
          </div>
          <div className="p-3 flex-grow">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
            <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">{blog.title}</h3>
            {blog.content && (
              <p className="text-xs text-gray-500 line-clamp-1">{excerpt}</p>
            )}
          </div>
        </>
      ) : (
        // Default and Featured layouts (vertical)
        <>
          <div className="relative aspect-video overflow-hidden">
            {blog.image ? (
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-3xl">MAEVA</span>
              </div>
            )}
            
            {/* Category badge */}
            {blog.category && (
              <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-amber-600 text-xs font-medium px-2 py-1 rounded-full">
                {blog.category}
              </span>
            )}
          </div>
          
          <div className="p-5">
            {/* Meta info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formattedDate}</span>
              </div>
              
              {blog.readTime && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{blog.readTime} min de lecture</span>
                </div>
              )}
            </div>
            
            {/* Title */}
            <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${variant === 'featured' ? 'text-xl' : 'text-lg'}`}>
              {blog.title}
            </h3>
            
            {/* Excerpt */}
            {blog.content && (
              <p className="text-gray-600 mb-4 line-clamp-2">{excerpt}</p>
            )}
            
            {/* Author and read more */}
            <div className="flex items-center justify-between mt-4">
              {blog.author && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-sm text-gray-500">{blog.author}</span>
                </div>
              )}
              
              <span className="text-amber-600 font-medium text-sm flex items-center group-hover:underline">
                Lire plus
                <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}