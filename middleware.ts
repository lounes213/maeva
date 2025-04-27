import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// This is your middleware configuration
export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Exclude the images folder
  if (url.pathname.startsWith('/images')) {
    return NextResponse.next(); // Allow image requests to bypass middleware
  }

  // Your existing middleware logic for other requests
  // For example, add authentication or other checks here

  return NextResponse.next(); // Allow other requests to proceed
}

// Specify the paths where middleware should run (optional)
export const config = {
  matcher: ['/api/:path*', '/:path*'], // Add paths that should be processed by middleware
};
