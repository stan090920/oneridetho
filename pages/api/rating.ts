import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import sendEmail from '@/lib/mailer';

const prisma = new PrismaClient();

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { rideId, rating, comment } = req.body;

  try {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: true },
    });
    if (!ride || !ride.driver) {
      return res.status(404).json({ error: "Ride or driver not found" });
    }

    const driverId = ride.driverId;
    const driver = await prisma.driver.findUnique({
      where: { id: driverId as number },
    });

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating)) {
      return res.status(400).json({ error: "Invalid rating value" });
    }

    const numberOfRatings = driver.numberOfRatings ?? 0;
    const newAverageRating = calculateNewAverage(
      driver.rating || 0,
      numberOfRatings,
      parsedRating
    );

    if (isNaN(newAverageRating)) {
      return res
        .status(500)
        .json({ error: "Error calculating new average rating" });
    }

    await prisma.$transaction([
      prisma.driver.update({
        where: { id: driverId as number },
        data: {
          rating: newAverageRating,
          numberOfRatings: numberOfRatings + 1,
        },
      }),
      prisma.rating.create({
        data: {
          value: parsedRating,
          comment: comment,
          driver: { connect: { id: driverId as number } },
        },
      }),
    ]);

    // Send email notification to the driver
    await sendEmail({
      subject: "You have been rated!",
      text: `A customer has rated you ${parsedRating} stars with the comment: "${comment}". Check your profile for more details.`,
      html: `<p>A customer has rated you <strong>${parsedRating} stars</strong> with the comment: "<em>${comment}</em>". Check your profile for more details.</p>`,
      recipient_email: driver.email,
    });

    res.status(200).json({ message: "Rating updated successfully" });
  } catch (error) {
    console.error('Detailed Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : null;
    res.status(500).json({ error: "Internal Server Error", message: errorMessage, stack: errorStack });
  }  
}

function calculateNewAverage(currentAverage: number, numberOfRatings: number, newRating: number): number {
  const totalRating = currentAverage * numberOfRatings + newRating;
  const newAverageRating = totalRating / (numberOfRatings + 1);
  return newAverageRating;
}
