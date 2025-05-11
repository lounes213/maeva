import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import {dbConnect} from '@/lib/mongo';
import User from '@/models/User';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Connect to MongoDB

  const { method } = req;

  if (method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}