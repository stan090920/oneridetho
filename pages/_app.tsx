import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from '../components/AuthProvider';
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <AuthProvider>
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID ?? ""}>
          <Toaster position="bottom-center" />
          <Navbar />
          <Component {...pageProps} />
        </GoogleOAuthProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
