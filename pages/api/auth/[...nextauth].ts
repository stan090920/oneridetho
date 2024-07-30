import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import sendEmail from "@/lib/mailer";

const prisma = new PrismaClient();

const crypto = require("crypto");

function generateUniqueSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        phoneNumber: { label: "Phone Number", type: "text" },
        photoUrl: { label: "Photo URL", type: "text" },
        provider: { label: "Provider", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (existingUser) {
          if (existingUser.provider === "credentials" && credentials.provider === "google") {
            throw new Error(
              "User already exists with credentials. Please sign in with email and password."
            );
          } else if (existingUser.provider === "google" && credentials.provider === "credentials") {
            throw new Error(
              "User already exists with Google. Please sign in with Google."
            );
          }
        }

        let account = await prisma.account.findUnique({
          where: { email: credentials.email },
        });

        if (!account) {
          const passwordToHash =
            credentials.provider === "google"
              ? credentials.email
              : credentials.password;
          const hashedPassword = await bcrypt.hash(passwordToHash, 10);

          const user = await prisma.user.create({
            data: {
              name: credentials.name,
              email: credentials.email,
              phone: credentials.phoneNumber,
              provider: credentials.provider,
              photoUrl: credentials.photoUrl || null, // if provided
            },
          });

          account = await prisma.account.create({
            data: {
              userId: user.id,
              email: credentials.email,
              password: hashedPassword,
            },
          });

          const supportEmail = "oneridetho242@gmail.com";

          // Send email to support team about new user signup
          await sendEmail({
            subject: "New User Signup",
            text: `A new user has signed up with the following details:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}`,
            html: `<p>A new user has signed up with the following details:</p>
                   <ul>
                     <li><strong>Name:</strong> ${user.name}</li>
                     <li><strong>Email:</strong> ${user.email}</li>
                     <li><strong>Phone:</strong> ${user.phone}</li>
                   </ul>`,
            recipient_email: supportEmail,
          });
        }

        if (account) {
          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            account.password
          );
          if (!isPasswordMatch && credentials.provider !== "google") {
            return null;
          }

          return { id: account.userId.toString(), email: account.email };
        } else {
          throw new Error("Unable to create or authenticate account");
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    //@ts-ignore
    async jwt({ token, user }) {
      if (user) {
        const sessionToken = generateUniqueSessionToken();

        await prisma.session.create({
          data: {
            userId: parseInt(user.id),
            sessionToken: sessionToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
      return token;
    },

    //@ts-ignore
    async session({ session, token }) {
      if (token.sub) {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(token.sub) },
        });

        if (user) {
          session.user = {
            ...session.user,
            id: user.id.toString(),
            name: user.name,
            image: user.photoUrl,
            phone: user.phone,
          };
        }
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
