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
    req.nextUrl.pathname === '/api/products' ||
    req.nextUrl.pathname === '/api/blog' ||
    req.nextUrl.pathname === '/api/categories';
  
  // Skip authentication for public routes
  if (isAuthRoute || isPublicApiRoute || req.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check if the route requires authentication
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/api/')) {
    // If no token is present, redirect to login
    if (!token) {
      console.log('No token found, redirecting to login');
      
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
      console.log('Token verified successfully:', decoded);
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error);
      
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
    '/api/((?!cloudinary-upload|upload).)*',
  ]
};
