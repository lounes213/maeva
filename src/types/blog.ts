// File: /app/types/blog.ts

export interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogApiResponse {
  success: boolean;
  message: string;
  error: boolean;
  data: BlogApiResponseData | null;
}

export interface BlogApiResponseData {
  posts: IBlogPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SingleBlogApiResponse {
  success: boolean;
  message: string;
  error: boolean;
  data: IBlogPost | null;
}

// Helper function to check if the API response has the correct format
export function isValidBlogApiResponse(data: any): data is BlogApiResponse {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.success === 'boolean' &&
    typeof data.message === 'string' &&
    typeof data.error === 'boolean' &&
    (data.data === null ||
      (typeof data.data === 'object' &&
        Array.isArray(data.data.posts) &&
        typeof data.data.pagination === 'object'))
  );
}

// Helper function to check if API response is the old format (direct array)
export function isLegacyBlogApiResponse(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.success === 'boolean' &&
    Array.isArray(data.data)
  );
}

// Helper function to safely parse blog posts from API response
export function extractBlogPostsFromResponse(responseData: any): IBlogPost[] {
  if (isValidBlogApiResponse(responseData) && responseData.data) {
    return responseData.data.posts;
  } else if (isLegacyBlogApiResponse(responseData)) {
    return responseData.data as IBlogPost[];
  } else if (Array.isArray(responseData)) {
    // Fallback for direct array response
    return responseData as IBlogPost[];
  }
  return [];
}