import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { driverId } = req.query;

  if (!driverId || Array.isArray(driverId)) {
    return res.status(400).json({ message: 'Invalid driver ID' });
  }

  try {
    const location = await prisma.location.findUnique({
      where: { driverId: parseInt(driverId) },
    });

    if (location) {
      const lat = JSON.parse(location.lat as string);
      const lng = JSON.parse(location.long as string);
      res.status(200).json({ lat, lng });
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
