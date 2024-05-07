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
    const phone = req.query.phone as string;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const user = await prisma.user.findUnique({
      where: {
        phone: phone,
      },
    });

    if (user) {
      return res.status(200).json({ phoneExists: true });
    } else {
      return res.status(200).json({ phoneExists: false });
    }
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({ error: 'Error checking phone number' });
  }
}
