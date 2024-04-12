import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function mapGender(genderString: string) {
  switch (genderString.toLowerCase()) {
    case 'male':
      return 'Male';
    case 'female':
      return 'Female';
    default:
      return 'Male';
  }
}


const crypto = require('crypto');

function generateUniqueSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}
export const authOptions = {

  providers: [


    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }, 
        dob: { label: "Date of Birth", type: "date" },
        gender: { label: "Gender", type: "text" } ,
        phoneNumber: { label: "Phone Number", type: "text" }
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        let account = await prisma.account.findUnique({
          where: { email: credentials.email },
        });

        if (!account) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);


          const genderEnum = mapGender(credentials.gender);

          const user = await prisma.user.create({
            data: {
              name: credentials.name,
              email: credentials.email,
              dob: new Date(credentials.dob),
              gender: genderEnum, 
              phone: credentials.phoneNumber
            },
          });

          account = await prisma.account.create({
            data: {
              userId: user.id,
              email: credentials.email,
              password: hashedPassword,
            },
          });
        }

        if (account) {
          const isPasswordMatch = await bcrypt.compare(credentials.password, account.password);
          if (!isPasswordMatch) {
         
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
            dob: user.dob,
            gender: user.gender,
            image: user.photoUrl,
            phone: user.phone,
          } as any; 
        }
      }
  
      return session;
    },
  },
};

export default NextAuth(authOptions);