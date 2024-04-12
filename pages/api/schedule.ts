import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const fromPhone = process.env.TWILIO_PHONE_NUMBER; 

const notificationNumbers =["12424212170", "12424701747", "12428086851", "12428108059"];


export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      userId,
      pickupLocation,
      dropoffLocation,
      scheduledPickupTime,
      fare,
      passengerCount,
      paymentMethod,
    } = req.body;

    const parsedUserId = parseInt(userId);

    if (
      isNaN(parsedUserId) ||
      !pickupLocation ||
      !dropoffLocation ||
      !scheduledPickupTime
    ) {
      return res.status(400).send("Missing or invalid required fields");
    }

    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    try {
      const scheduledRide = await prisma.ride.create({
        data: {
          userId: parsedUserId,
          pickupLocation,
          dropoffLocation,
          fare: parseFloat(fare),
          passengerCount: parseInt(passengerCount),
          paymentMethod,
          pickupTime: new Date(scheduledPickupTime),
          dropoffTime: null,
          driverId: null,
          isScheduled: true,
          status: "Scheduled",
          isConfirmed: false,
          scheduledPickupTime: new Date(scheduledPickupTime),
        },
      });

      const scheduledPickupDateTime = new Date(scheduledPickupTime);
      const formattedPickupTime = `${scheduledPickupDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ${scheduledPickupDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;

      const messageBody = `${user.name} has scheduled a ride!\n
      Pickup Time: ${formattedPickupTime}\n
      Pickup Location: ${pickupLocation}\n
      Drop-off Location: ${dropoffLocation}\n
      Passengers: ${passengerCount}\n
      View Details: https://driver-oneridetho.vercel.app/dashboard?rideId=${scheduledRide.id}`;

      notificationNumbers.forEach(async (number) => {
        try {
          await twilioClient.messages.create({
            body: messageBody,
            from: fromPhone,
            to: number,
          });
        } catch (error) {
          console.error('Error sending SMS:', error);
        }
      });

      res.status(200).json(scheduledRide);
    } catch (error) {
      console.error("Error scheduling ride:", error);
      res.status(500).send("Error scheduling ride");
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
