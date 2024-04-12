import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const prisma = new PrismaClient();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const rideId = parseInt(req.query.rideId as string);

    try {
      const ride = await prisma.ride.update({
        where: { id: rideId },
        data: { status: 'Cancelled' },
        include: { driver: true, user: true } 
      });

    
      if (ride.driver && ride.driver.phone) {
        await twilioClient.messages.create({
          body: `Ride with ${ride.user.name} has been cancelled.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: ride.driver.phone
        });
      }

      res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (error) {
      console.error("Error cancelling ride:", error);
      res.status(500).json({ message: 'Error cancelling ride' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
