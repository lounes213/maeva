// File: /lib/api.ts


const API_BASE_URL = 'https://maeva-three.vercel.app';

// Generic type-safe API request handler
async function apiRequest<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Try to get error message from response if possible
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }

    // First get the response as text
    const responseText = await response.text();
    
    // Then try to parse it as JSON
    try {
      return JSON.parse(responseText) as T;
    } catch (error) {
      console.error('Invalid JSON response:', responseText);
      throw new Error('Invalid response format from server');
    }
  } catch (error: any) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Blog API functions
export async function fetchBlogPosts(
  page = 1, 
  limit = 10, 
  category?: string, 
  tag?: string
): Promise<BlogApiResponse> {
  let queryParams = `?page=${page}&limit=${limit}`;
  
  if (category) {
    queryParams += `&category=${encodeURIComponent(category)}`;
  }
  
  if (tag) {
    queryParams += `&tag=${encodeURIComponent(tag)}`;
  }
  
  return apiRequest<BlogApiResponse>(`/api/blog${queryParams}`);
}

export async function fetchBlogPost(slug: string): Promise<SingleBlogApiResponse> {
  return apiRequest<SingleBlogApiResponse>(`/api/blog?slug=${encodeURIComponent(slug)}`);
}

export async function deleteBlogPost(slug: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(`/api/blog?slug=${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}

// Function to handle blog post submission (create or update)
export async function submitBlogPost(
  formData: FormData, 
  slug?: string
): Promise<SingleBlogApiResponse> {
  const method = slug ? 'PUT' : 'POST';
  const endpoint = slug ? `/api/blog?slug=${encodeURIComponent(slug)}` : '/api/blog';
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body: formData,
    // Don't set Content-Type header as the browser will set it properly for FormData
  });

  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    } catch (e) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }

  const responseText = await response.text();
  
  try {
    return JSON.parse(responseText) as SingleBlogApiResponse;
  } catch (error) {
    console.error('Invalid JSON response:', responseText);
    throw new Error('Invalid response format from server');
  }
}