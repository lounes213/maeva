import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge class names intelligently (commonly used in Tailwind apps)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a string into a URL-friendly slug
 * Examples:
 *   "Hello World!" -> "hello-world"
 *   "React & TypeScript" -> "react-typescript"
 */
export default function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word characters
    .replace(/[\s_-]+/g, '-')     // Replace spaces/underscores with dash
    .replace(/^-+|-+$/g, '');     // Trim dashes from start and end
}


export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
