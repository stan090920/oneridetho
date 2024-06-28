import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import sendDriverAlertEmail from '../../sendDriverAlertEmail';

function formatTime(date: any) {
  if (!date) return "";
  const dateTime = new Date(Date.parse(date));
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return dateTime.toLocaleString("en-US", options);
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const {
      userId,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates,
      scheduledPickupTime,
      fare,
      passengerCount,
      paymentMethod,
      emails,
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
          pickupLocation: JSON.stringify(pickupCoordinates),
          dropoffLocation: JSON.stringify(dropoffCoordinates),
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


      const messageBody = `${user.name} has scheduled a ride!\n
      Pickup Time: ${formatTime(scheduledPickupTime)}.\n
      Pickup Location: ${pickupLocation},\n
      Drop-off Location: ${dropoffLocation},\n
      Passengers: ${passengerCount}.`;

      // Call the email sending function
      try {
        await sendDriverAlertEmail(emails, messageBody);
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        res.status(500).json({ message: "Failed to send emails" });
      }

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
