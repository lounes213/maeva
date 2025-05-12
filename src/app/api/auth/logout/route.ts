import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Logout request received');
    
    // Create a response
    const response = NextResponse.json(
      { success: true, message: 'Déconnexion réussie' },
      { status: 200 }
    );
    
    // Clear the token cookie with explicit settings
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
    
    console.log('Token cookie cleared');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}