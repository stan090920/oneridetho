import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import cloudinary from "cloudinary";
import { IncomingForm } from 'formidable';


cloudinary.v2.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY_CLOUD, 
  api_secret: process.env.API_SECRET
});

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  const userId = parseInt(session.user.id);

  if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ message: "Error processing form data" });
        return;
      }

      if (!files.file) {
        res.status(400).json({ message: "No file uploaded." });
        return;
      }

      try {
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const result = await cloudinary.v2.uploader.upload(file.filepath);

        const user = await prisma.user.update({
          where: { id: userId },
          data: { photoUrl: result.secure_url },
        });

        res.json({ message: 'Photo updated successfully', user });
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: "Error uploading file" });
      }
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
