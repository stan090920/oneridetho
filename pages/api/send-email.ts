import { NextApiRequest, NextApiResponse } from 'next';
import sendEmail from '../../emailServer'; // Assuming emailServer.js contains the sendEmail function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { OTP, recipient_email } = req.body;
    try {
      await sendEmail({ OTP, recipient_email });
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
