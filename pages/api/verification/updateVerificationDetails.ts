// pages/api/updateVerificationDetails.ts

import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import sendEmail from "@/lib/mailer";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  const userId = parseInt(session.user.id);
  const userEmail = session.user.email;
  const userName = session.user.name;

  const supportEmail = "oneridetho242@gmail.com";

  if (req.method === "POST") {
    const { governmentIssuedId, verificationPhotoUrl } = req.body;

    if (!governmentIssuedId || !verificationPhotoUrl) {
      res
        .status(400)
        .json({
          message:
            "Both governmentIssuedId and verificationPhotoUrl are required.",
        });
      return;
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          governmentIssuedId,
          verificationPhotoUrl,
        },
      });

      // Send email to support team
      await sendEmail({
        subject: "New Verification Documents Uploaded",
        text: `${userName} has uploaded their verification documents. Please log in to the admin page to review and verify the documents.`,
        html: `<p><strong>${userName}</strong> has uploaded their verification documents. Please log in to the <a href="https://oneridetho-driver.vercel.app/admin/AdminPanel">admin page</a> to review and verify the documents.</p>`,
        recipient_email: supportEmail,
      });

      // Send email to user
      await sendEmail({
        subject: "Documents Received",
        text: `Dear ${userName},\n\nWe have received your verification documents and are currently processing them. We will notify you once the verification is complete.\n\nThank you for your patience.`,
        html: `<p>Dear ${userName},</p>
               <p>We have received your verification documents and are currently processing them. We will notify you once the verification is complete.</p>
               <p>Thank you for your patience.</p>`,
        recipient_email: userEmail,
      });

      res.json({ message: "Verification details updated successfully", user });
    } catch (error) {
      console.error("Error updating verification details:", error);
      res.status(500).json({ message: "Error updating verification details" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
