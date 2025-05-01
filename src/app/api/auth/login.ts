import { NextApiRequest, NextApiResponse } from 'next';
import dotenv from 'dotenv';
import dbConnect from '@/lib/mongo';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Auth methods removed' });
}