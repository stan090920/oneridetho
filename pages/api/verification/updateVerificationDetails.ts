// pages/api/updateVerificationDetails.ts

import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

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

      res.json({ message: "Verification details updated successfully", user });
    } catch (error) {
      console.error("Error updating verification details:", error);
      res.status(500).json({ message: "Error updating verification details" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
