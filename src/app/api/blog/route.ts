// File: pages/api/blog.ts (Next.js Pages Router)
// Use this approach if you're using the Pages Router instead of App Router

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Required to disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Type for our response
type BlogApiResponse = {
  success: boolean;
  message: string;
  error: boolean;
  data: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlogApiResponse>
) {
  const { method } = req;
  console.log(`Received ${method} request to /api/blog`);

  try {
    switch (method) {
      case 'GET':
        return await handleGetRequest(req, res);
      case 'POST':
        return await handlePostRequest(req, res);
      case 'PUT':
        return await handlePutRequest(req, res);
      case 'DELETE':
        return await handleDeleteRequest(req, res);
      default:
        // Very important: Set the Allow header with supported methods
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} Not Allowed`,
          error: true,
          data: null
        });
    }
  } catch (error: any) {
    console.error(`Error in API route (${method}):`, error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
      error: true,
      data: null
    });
  }
}

// Parse multipart form data (for POST and PUT requests with file uploads)
const parseFormData = async (req: NextApiRequest) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        return `${uuidv4()}-${part.originalFilename?.replace(/\s/g, '-')}`;
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

// Process the parsed form data into a blog post object
const processBlogPostData = (fields: formidable.Fields, files: formidable.Files) => {
  const blogPost: any = {};

  // Process text fields
  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName];
    
    if (fieldName === 'tags' && field && field[0]) {
      // Process tags into an array
      blogPost.tags = field[0].split(',').map((tag: string) => tag.trim());
    } else if (field && field[0]) {
      // Add other fields directly
      blogPost[fieldName] = field[0];
    }
  });

  // Process image files
  const imageFiles = files.images;
  if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
    // Get uploaded file paths and convert to public URLs
    const imagePaths = imageFiles.map((file) => {
      const relativePath = path.relative(
        path.join(process.cwd(), 'public'),
        file.filepath
      );
      return `/${relativePath.replace(/\\/g, '/')}`;
    });

    blogPost.images = imagePaths;
    
    // Set the first image as the main image
    if (imagePaths.length > 0) {
      blogPost.image = imagePaths[0];
    }
  }

  return blogPost;
};

// GET handler
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse<BlogApiResponse>) {
  const { slug, page = '1', limit = '10', category, tag } = req.query;

  // If slug is provided, return a single blog post
  if (slug) {
    // Here you would fetch the blog post from your database
    const post = {}; // Replace with actual database query
    
    return res.status(200).json({
      success: true,
      message: 'Blog post retrieved successfully',
      error: false,
      data: post
    });
  }

  // Handle listing blog posts with pagination and filters
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  
  // Here you would query your database with these parameters
  const posts = []; // Replace with actual database query
  const total = 0; // Replace with count from database

  return res.status(200).json({
    success: true,
    message: 'Blog posts retrieved successfully',
    error: false,
    data: {
      posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
}

// POST handler
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse<BlogApiResponse>) {
  // Parse the multipart form data
  const { fields, files } = await parseFormData(req);
  
  // Process the data into a blog post object
  const blogPostData = processBlogPostData(fields, files);
  
  // Add creation timestamps
  blogPostData.createdAt = new Date().toISOString();
  blogPostData.updatedAt = new Date().toISOString();
  
  // Here you would save to your database
  // const savedPost = await db.blogPosts.create(blogPostData);
  
  // For now, just return the processed data
  const savedPost = {
    _id: uuidv4(),
    ...blogPostData
  };

  return res.status(201).json({
    success: true,
    message: 'Blog post created successfully',
    error: false,
    data: savedPost
  });
}

// PUT handler
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse<BlogApiResponse>) {
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({
      success: false,
      message: 'Slug is required',
      error: true,
      data: null
    });
  }

  // Parse the multipart form data
  const { fields, files } = await parseFormData(req);
  
  // Process the data into a blog post object
  const blogPostData = processBlogPostData(fields, files);
  
  // Update the timestamp
  blogPostData.updatedAt = new Date().toISOString();
  
  // Here you would update your database record
  // const updatedPost = await db.blogPosts.findOneAndUpdate({ slug }, blogPostData, { new: true });
  
  // For now, just return the processed data
  const updatedPost = {
    _id: uuidv4(),
    ...blogPostData
  };

  return res.status(200).json({
    success: true,
    message: 'Blog post updated successfully',
    error: false,
    data: updatedPost
  });
}

// DELETE handler
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse<BlogApiResponse>) {
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({
      success: false,
      message: 'Slug is required',
      error: true,
      data: null
    });
  }
  
  // Here you would delete the blog post from your database
  // await db.blogPosts.deleteOne({ slug });
  
  return res.status(200).json({
    success: true,
    message: 'Blog post deleted successfully',
    error: false,
    data: null
  });
}