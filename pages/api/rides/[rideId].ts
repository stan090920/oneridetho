import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method === 'GET') {
        try {
          const rideIdStr = typeof req.query.rideId === 'string' ? req.query.rideId : null;
          if (!rideIdStr) {
            return res.status(400).json({ message: 'Invalid ride ID' });
          }
          const rideId = parseInt(rideIdStr);
          console.log("Received rideId:", rideId);
      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: {
          driver: true, 
        },
      });

      console.log("Fetched ride details:", ride);

      if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      res.status(200).json(ride);
    } catch (error) {
      console.error('Error fetching ride details:', error);
      res.status(500).json({ message: 'Error fetching ride details' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
