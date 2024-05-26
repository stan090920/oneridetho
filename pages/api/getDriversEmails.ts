import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const drivers = await prisma.driver.findMany({
        select: { email: true }
      });
      console.log('Driver emails fetched:', drivers);
      res.status(200).json(drivers);
    } catch (error) {
      console.error('Error fetching driver emails:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
