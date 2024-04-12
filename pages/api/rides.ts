import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  const userId = parseInt(session.user.id);

  if (req.method === 'GET') {
    try {
      const userRides = await prisma.ride.findMany({
        where: {
          userId: userId, 
        },
        include: {
          user: true, 
        },
      });

      res.status(200).json(userRides);
    } catch (error) {
      console.error('Request error', error);
      res.status(500).json({ error: 'Error fetching user rides' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
