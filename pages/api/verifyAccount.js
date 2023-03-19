import { PrismaClient } from "@prisma/client";

export default function handler(req, res) {
  const prisma = new PrismaClient();
  const { email, code } = req.body;
  // Check the code
  prisma.user
    .findUnique({
      where: {
        email: email,
      },
    })
    .then(async (user) => {
      if (user) {
        // If the user is already verified
        if (user.status === "VERIFIED") {
          res.status(400).json({ error: "Account already verified" });
        }
        // If the code is correct
        else if (user.code === code) {
          // Update the user status to verified
          await prisma.user.update({
            where: {
              email: email,
            },
            data: {
              status: "VERIFIED",
            },
          });
          res.status(200).json({ message: "Account verified" });
        }
        // If the code is incorrect
        else {
          res.status(400).json({ error: "Incorrect code" });
        }
      } else {
        res.status(400).json({ error: "No user found" });
      }
    });
}
