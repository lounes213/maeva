import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {dbConnect} from '@/lib/mongo';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await req.json();

    // Vérifier que l'email et le mot de passe sont fournis
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Créer le token JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Créer la réponse
    const response = NextResponse.json(
      { 
        message: 'Connexion réussie',
        user: {
          id: user._id,
          email: user.email,
          name: user.name || user.email.split('@')[0]
        },
        redirectTo: '/dashboard'
      },
      { status: 200 }
    );

    // Définir le cookie avec le token
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      path: '/', // Ensure cookie is available for all paths
      maxAge: 60 * 60 * 24 // 24 heures
    });

    return response;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return NextResponse.json(
      { message: 'Erreur du serveur' },
      { status: 500 }
    );
  }
}