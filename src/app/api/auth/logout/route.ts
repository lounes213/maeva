import { NextResponse } from 'next/server';

export async function POST() {
  // Logique pour gérer la déconnexion de l'utilisateur
  return NextResponse.json({ message: 'Déconnexion réussie' }, { status: 200 });
}