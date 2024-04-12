import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import twilio from "twilio";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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
      stops,
      fare,
      passengerCount,
      paymentMethod,
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
        pickupLocation,
        dropoffLocation,
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

    /*
    const drivers = await prisma.driver.findMany({
      select: {
        phone: true
      }
    });
    const driverNumbers = drivers.map(driver => driver.phone).filter(phone => phone !== null);

    */

     /*const dispatchers = ["12424212170", "12424701747", "12428086851", "12428108059"]; */
    const driverNumbers = ["12424212170", "12424701747", "12428086851", "12428108059"] 
    const messageBody = `${user.name} has scheduled a ride!
Pickup: ${pickupLocation},
Drop-off: ${dropoffLocation},
Stops: ${stops.map((stop: { address: any; }) => stop.address).join(', ')},
Passengers: ${passengerCount},
View details: https://driver-oneridetho.vercel.app/dashboard?rideId=${ride.id}`;

    for (const number of driverNumbers) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          body: messageBody,
          to: number,
        });
      } catch (error) {
        console.error("Error in booking ride:", (error as Error).message);
        res.status(500).json({ message: "Internal Server Error" });
      }      
    }

    res.status(200).json({
      message: "Ride booked successfully!",
      rideId: ride.id,
    });
  } catch (error) {
    console.log(error) 
    const message = error instanceof Error ? error.message : "Unexpected Error";
    return NextResponse.json({ message }, { status: 500 })
   
  }
}
