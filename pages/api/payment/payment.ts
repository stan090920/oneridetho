import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import qs from "qs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { orderId, currency, amount, redirectUrl, callbackUrl } = req.body;

    const data = qs.stringify({
      authenticationKey: "B0308AF958D347C5BA19880DDD025BFC",
      userId: "48986",
      orderId,
      currency,
      amount,
      redirectUrl,
      callbackUrl,
      unique_order_id: "true",
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://kanoo-gateway-sandbox.kardsys.com/visipay/api/external/payment/request/token",
      headers: {
        authority: "kanoo-gateway-demo.kardsys.com",
        accept: "*/*",
        "x-tenant": "kanoo",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        "content-type": "application/x-www-form-urlencoded",
        origin: "null",
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "accept-language": "en-US,en;q=0.9,ja;q=0.8",
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      const { statusCode, result } = response.data;

      if (statusCode === "SUCCESS") {
        res.status(200).json({
          statusCode: "SUCCESS",
          status: 0,
          result: `https://external.kanoopays.com/pay/login//${result}`,
          message: null,
        });
      } else {
        res.status(400).json({ message: "Payment request failed" });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
