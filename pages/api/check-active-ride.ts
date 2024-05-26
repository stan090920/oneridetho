import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getSession({ req });
    console.log("Session data:", session);

    if (!session || !session.user) {
      console.log("Session not found or user not authenticated");
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = parseInt(session.user.id as unknown as string, 10);
    console.log("Parsed user ID:", userId);

    if (isNaN(userId)) {
      console.log("Invalid user ID:", session.user.id);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const activeRide = await prisma.ride.findFirst({
      where: {
        userId: userId,
        status: {
          in: ['Requested', 'InProgress'],
        },
      },
    });

    console.log("Active ride found:", activeRide);

    if (activeRide) {
      return res.status(200).json({ hasActiveRide: true });
    } else {
      return res.status(200).json({ hasActiveRide: false });
    }
  } catch (error) {
    console.error('Error checking active ride:', error);
    return res.status(500).json({ message: 'Error checking active ride' });
  }
}
