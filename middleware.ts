import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(req: NextRequest) {
  // Allow OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Get the token from cookies
  const token = req.cookies.get('token')?.value;
  
  // Define routes that don't need authentication
  const isAuthRoute = req.nextUrl.pathname === '/api/auth/login' || 
                     req.nextUrl.pathname === '/api/auth/register';
  
  const isPublicApiRoute = 
    req.nextUrl.pathname === '/api/upload' || 
    req.nextUrl.pathname === '/api/cloudinary-upload' ||
    req.nextUrl.pathname === '/api/upload-cloudinary' ||
    req.nextUrl.pathname === '/api/direct-upload' ||
    req.nextUrl.pathname === '/api/test-upload' ||
    req.nextUrl.pathname === '/api/products' ||
    req.nextUrl.pathname === '/api/blog' ||
    req.nextUrl.pathname === '/api/categories' ||
    req.nextUrl.pathname === '/api/orders';
  
  // Skip authentication for public routes
  if (isAuthRoute || isPublicApiRoute || req.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check if the route requires authentication
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/api/')) {
    // If no token is present, redirect to login
    if (!token) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
      }
      
      // Prevent redirect loops
      if (req.nextUrl.pathname === '/admin/login') {
        return NextResponse.next();
      }
      
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
      }
      
      // Prevent redirect loops
      if (req.nextUrl.pathname === '/admin/login') {
        return NextResponse.next();
      }
      
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    // Only include specific API routes that need authentication
    '/api/((?!cloudinary-upload|upload|upload-cloudinary|direct-upload|test-upload|products|blog|categories).)*',
  ]
};
