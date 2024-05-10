import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handleCheckOverlap(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { scheduledPickupTime } = req.body;

    if (!scheduledPickupTime) {
      return res.status(400).send("Missing scheduled pickup time");
    }

    try {
      const overlappingRides = await prisma.ride.findMany({
        where: {
          AND: [
            { pickupTime: new Date(scheduledPickupTime) },
            { dropoffTime: null },
            { status: 'Scheduled' }
          ]
        },
      });

      if (overlappingRides.length > 0) {
        return res.status(200).json({ hasOverlap: true });
      }

      return res.status(200).json({ hasOverlap: false });
    } catch (error) {
      console.error("Error checking for overlap:", error);
      return res.status(500).send("Error checking for overlap");
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
