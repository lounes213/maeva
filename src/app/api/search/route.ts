import { NextRequest, NextResponse } from 'next/server';

// Search API endpoint moved from /search to /api/search
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Search API endpoint' });
}