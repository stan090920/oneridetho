import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return res.status(200).json({ emailExists: true });
    } else {
      return res.status(200).json({ emailExists: false });
    }
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({ error: 'Error checking email' });
  }
}
