import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value; // Extraction de la valeur du cookie

  const publicPaths = ['/api/auth/login', '/api/auth/register'];
  if (publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  try {
    // Vérification simple basée sur Kinde Auth
    const user = await fetch('https://your-kinde-auth-endpoint.com/validate', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    if (!user || !user.isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Vérification du rôle pour les routes d'administration
    if (req.nextUrl.pathname.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Authentication error:', err);
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
