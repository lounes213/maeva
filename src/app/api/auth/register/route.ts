import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongo';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: 'user', // Default role for new registrations
      createdAt: new Date(),
    });

    await newUser.save();

    return NextResponse.json(
      { message: 'Inscription réussie', userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}