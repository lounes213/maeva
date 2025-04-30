import { NextApiRequest, NextApiResponse } from 'next';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminRoute = process.env.ADMIN_ROUTE || '/admin';

  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userRole = req.headers['x-user-role']; // Assuming role is passed in headers

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.status(200).json({ message: `Welcome to the admin route: ${adminRoute}` });
}