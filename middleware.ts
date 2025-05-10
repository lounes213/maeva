import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const isAuthRoute = req.nextUrl.pathname === '/api/auth/login' || 
                     req.nextUrl.pathname === '/api/auth/register';

  // Ne pas vérifier le token pour les routes d'authentification
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Vérifier si la route nécessite une authentification
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/api/')) {
    if (!token) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/api/blog']
  
};
