// pages/api/getVerificationDetails.ts

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

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          governmentIssuedId: true,
          verificationPhotoUrl: true,
          verified: true,
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error("Error retrieving verification details:", error);
      res
        .status(500)
        .json({ message: "Error retrieving verification details" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
