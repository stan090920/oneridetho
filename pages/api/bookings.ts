import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { NextResponse } from "next/server";
import sendDriverAlertEmail from '../../sendDriverAlertEmail';

const prisma = new PrismaClient();


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  if (!session.user || !session.user.image) {
    res.status(400).json({ message: "You must have a profile photo to book a ride." });
    return;
  }

  const userId = parseInt(session.user.id);

  try {
    const {
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates,
      stops,
      fare,
      passengerCount,
      paymentMethod,
      emails,
    } = req.body;

    if (stops && stops.length > 3) {
      res.status(400).json({ message: "You can only add up to 3 stops." });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const ride = await prisma.ride.create({
      data: {
        userId,
        pickupLocation: JSON.stringify(pickupCoordinates),
        dropoffLocation: JSON.stringify(dropoffCoordinates),
        stops: JSON.stringify(stops), 
        pickupTime: new Date(),
        fare: parseFloat(fare),
        tip: 5, 
        passengerCount: parseInt(passengerCount, 10),
        isAccepted: false,
        isConfirmed: false,
        paymentMethod,
        status: 'Requested',
        stopWaitTimes: JSON.stringify([]),
        extraCharges: 0, 
      },
    });

    const rideUrl = `https://oneridetho-driver.vercel.app/dashboard?rideId=${ride.id}`;

    const messageBody = `${user.name} has booked a ride for now!
      Pickup: ${pickupLocation},
      Drop-off: ${dropoffLocation},
      Stops: ${stops.map((stop: { address: any }) => stop.address).join(", ")},
      Passengers: ${passengerCount}.
      You can view the ride details <a href="${rideUrl}">here</a>.`;


    // Send emails to drivers
    try {
      await sendDriverAlertEmail(emails , messageBody);
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      res.status(500).json({ message: "Failed to send emails" });
    }

    res.status(200).json({
      message: "Ride booked successfully!",
      rideId: ride.id,
    });
  } catch (error) {
    console.log(error);
    const message = error instanceof Error ? error.message : "Unexpected Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
