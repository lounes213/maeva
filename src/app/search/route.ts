import { NextRequest, NextResponse } from 'next/server';

// Cette route est nécessaire pour éviter le prérendu statique de la page de recherche
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Search API endpoint' });
}