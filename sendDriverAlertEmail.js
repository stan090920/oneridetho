const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  debug: true,
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSWORD,
  },
});

const sendDriverAlertEmail = async (emailList, messageBody) => {
  try {
    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: emailList.join(","),
      subject: "New Ride Alert",
      html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>New Ride Alert</title>
            </head>
            <body>
                <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
                    <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                        <div style="border-bottom: 1px solid #eee">
                            <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">One Ride Tho</a>
                        </div>
                        <p style="font-size: 1.1em">Hi,</p>
                        <p>${messageBody}</p>
                        <p style="font-size: 0.9em;">Regards,<br />One Ride Tho Team</p>
                        <hr style="border: none; border-top: 1px solid #eee" />
                    </div>
                </div>
            </body>
            </html>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Emails sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendDriverAlertEmail;
