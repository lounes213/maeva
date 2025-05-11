import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import {dbConnect} from '@/lib/mongo';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid or missing user ID' }, { status: 400 });
    }

    const { email, password, role } = await req.json();

    await dbConnect();

    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return NextResponse.json({ message: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    const updateData: any = { email, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid or missing user ID' }, { status: 400 });
    }

    await dbConnect();

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
