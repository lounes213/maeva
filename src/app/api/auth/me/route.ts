import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import {dbConnect} from '@/lib/mongo';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/auth/me - Checking authentication');
    
    // Récupérer le token depuis les cookies
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    
    console.log('Token found in cookies:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log('Token verified successfully, userId:', decoded.userId);

      // Récupérer les informations de l'utilisateur
      await dbConnect();
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        console.log('User not found in database for userId:', decoded.userId);
        return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
      }

      console.log('User found:', user.email);
      
      // Renvoyer les informations de l'utilisateur
      return NextResponse.json({
        _id: user._id,
        email: user.email,
        createdAt: user.createdAt
      });
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      // If token is invalid, clear it
      const response = NextResponse.json(
        { message: 'Token invalide ou expiré' },
        { status: 401 }
      );
      
      response.cookies.set({
        name: 'token',
        value: '',
        expires: new Date(0),
        path: '/'
      });
      
      return response;
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json(
      { message: 'Erreur d\'authentification' },
      { status: 401 }
    );
  }
}