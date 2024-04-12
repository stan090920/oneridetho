import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const drivers = await prisma.driver.findMany({
      select: { id: true }
    });
    res.status(200).json(drivers.map(driver => driver.id));
  } catch (error) {
    console.error('Error fetching driver IDs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
