import { PrismaClient } from "@prisma/client";

export default function handler(req, res) {
  const prisma = new PrismaClient();
  const nodemailer = require("nodemailer");
  const { email } = req.body;
  // Check if the email is already in use
  prisma.User.findUnique({
    where: {
      email: email,
    },
  }).then((user) => {
    if (user) {
      res.status(400).json({ error: "Email already in use" });
    } else {
      // Create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use SSL
        auth: {
          user: "someone@gmail.com",
          pass: "xxxxxxxxxxxxxxxxxx",
        },
      });

      // Generate a random 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000);
      // setup email data with unicode symbols
      let mailOptions = {
        from: "someone@gmail.com",
        to: email,
        subject: "Passless Auth Demo",
        text: `Your verification code is ${code}`,
        html: `<b>Your verification code is <strong>${code}</strong></b>`,
      };
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ error: "Internal server error" });
        } else {
          console.log("Message sent: %s", info.messageId);
          // Respond with a message code sent
          res.status(200).json({ message: "Code sent" });
        }
      });

      // Save the user to the database on model User
      prisma.user
        .create({
          data: {
            email: email,
            code: code,
            status: "UNVERIFIED",
          },
        })
        .then((user) => {
          // Respond with a message code sent
          res.status(200).json({ message: "Code sent" });
        })
        .catch((e) => {
          console.log(e);
          res.status(500).json({ error: "Internal server error" });
        });
    }
  });
}
