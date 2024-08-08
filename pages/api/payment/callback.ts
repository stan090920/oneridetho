import { NextApiRequest, NextApiResponse } from "next";
import { retrieveUrl } from "../../../utils/utils"; // Adjust the import path as needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).send("Invalid token");
  }

  try {
    // Retrieve the URL from the stored ID
    const redirectUrl = await retrieveUrl(token);
    console.log("Redirect URL:", redirectUrl);

    if (!redirectUrl) {
      return res.status(404).send("URL not found");
    }

    // Handle payment status update
    const { netAmount } = req.body;

    if (!netAmount) {
      console.log("Net Amount not found in the request body");
    }

    if (netAmount > 0) {
      // Set the state to "paid"
      // (e.g., update the order status in the database)
      console.log("Payment successful");
    } else {
      console.log("Payment failed");
    }

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error during URL retrieval or payment processing:", error);
    return res.status(400).send("Invalid token");
  }
}
