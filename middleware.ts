import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token');

  const publicPaths = ['/api/auth/login', '/api/auth/register'];
  if (publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  try {
    const decodedToken = jwt.verify(token, 'your-secret-key');

    // Vérification du rôle pour les routes d'administration
    if (req.nextUrl.pathname.startsWith('/admin') && decodedToken.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Invalid token:', err);
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
