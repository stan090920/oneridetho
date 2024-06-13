import { useState, FormEvent, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import logo from "../../assets/oneridetho_logo_600ppi.png";
import axios from 'axios';
import { useAuth } from '@/components/AuthProvider';
import toast from "react-hot-toast";
import { emailRegex, passwordRegex } from '@/scripts/RegEx';
import { GoogleLoginButton } from "react-social-login-buttons";
import { useGoogleLogin } from "@react-oauth/google";
//import { LoginSocialFacebook } from "reactjs-social-login";

export default function Login() {
  const { setOTP, email, setEmail } = useAuth();
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [emailLabelAnimated, setEmailLabelAnimated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (email.trim() !== "") {
      setEmailLabelAnimated(true);
    }
  }, [email]);


  const checkEmailExists = async (email: any) => {
    try {
      const response = await fetch(`/api/check-email?email=${email}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.emailExists;
      } catch (error) {
        console.error("Error fetching email:", error);
        return false;
      }
  };

  const navigateToOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (loading) return;

    setLoading(true);
    toast.loading("Sending OTP...");

    // Generate OTP
    const OTP = Math.floor(Math.random() * 9000 + 1000).toString();
    setOTP(OTP);

    // Check if email exists
    try {
      const emailExist = await checkEmailExists(email);
      if (!emailExist) {
        toast.error("Email does not exist. Please Sign Up.");
        return;
      }
    } catch (error) {
      console.error("Error checking email existence:", error);
      toast.error("Failed to check email existence. Please try again.");
      return;
    }

    const sendEmail = async ({ OTP, recipient_email }: { OTP: string, recipient_email: string }) => {
      try {
        const response = await axios.post('/api/send-email', { OTP, recipient_email });
        return response.data;
      } catch (error) {
        throw error;
      }
    };

    // Send recovery email
    try {
      await sendEmail({ OTP, recipient_email: email });

      router.push('/PasswordResetParent');
    } catch (error) {
      console.error("Error sending recovery email:", error);
      alert("Failed to send recovery email. Please try again later.");
    } finally {
      toast.dismiss();
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    navigateToOtp();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(email)){
      toast.error("Please enter a valid email address");
      return;
    }
    if (!passwordRegex.test(password)){
      toast.error(
        "Password must contain at least 8 characters, one number and one special character"
      );
      return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    });
  
    if (result && !result.error) {
      toast.success("Signed in successfully!");
      router.push('/');
    } else if (result) {
      toast.error("Email or password is incorrect");
    }
  };

  const handleContinueWithGoogle = useGoogleLogin({
    onSuccess: async (response: any) => {
      try {
        const userData = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );


        const fetchedUser = {
          email: userData.data.email,
          name: userData.data.name,
          picture: userData.data.picture,
        };

        console.log(fetchedUser);
        toast.success("Signed in successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch user information from Google");
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Google login failed");
    },
    scope: "profile email", // Adding the required scopes
  });

  const onFocusHandler = (
    labelId: string, 
    inputBoxId: string
    ) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.remove('Label');
      label.classList.add('AnimatedLabel');
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.add('InputBoxExtraShadow');
      inputBox.classList.add('InputBoxPrimaryBorderColour');
    }
  };

  const restoreDefaultLabelStyles = (
    inputElement: HTMLInputElement, 
    labelId: string, 
    inputBoxId: string
    ) => {
    const label = document.getElementById(labelId);
    const isInputFieldBlank = inputElement.value.trim() === '';
    if (isInputFieldBlank && label) {
      label.classList.remove('AnimatedLabel');
      label.classList.add('Label');
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.remove('InputBoxExtraShadow');
      inputBox.classList.remove('InputBoxPrimaryBorderColour');
    }
  };


  return (
    <div className="FormContainer pt-0">
      <form onSubmit={handleSubmit} className="LoginForm space-y-4">
        <div className="text-center flex justify-center pt-5">
          <Image
            src={logo}
            alt="logo"
            width={150}
            height={150}
            draggable="false"
          />
        </div>
        <div className="sm:text-[24px] text-[22px] text-black font-semibold">
          Log in
        </div>
        <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
          <label
            id="emailFieldLabel"
            className={
              emailLabelAnimated || email.trim() !== ""
                ? "AnimatedLabel"
                : "Label"
            }
          >
            Email Address
          </label>
          <div id="emailFieldInputBox" className="InputBox">
            <input
              type="email"
              className="StandardInput"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() =>
                onFocusHandler("emailFieldLabel", "emailFieldInputBox")
              }
              onBlur={(e) =>
                restoreDefaultLabelStyles(
                  e.target,
                  "emailFieldLabel",
                  "emailFieldInputBox"
                )
              }
            />
          </div>
        </div>

        <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
          <label id="passwordFieldLabel" className="Label">
            Password
          </label>
          <div id="passwordFieldInputBox" className="InputBox">
            <input
              type="password"
              className="StandardInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() =>
                onFocusHandler("passwordFieldLabel", "passwordFieldInputBox")
              }
              onBlur={(e) =>
                restoreDefaultLabelStyles(
                  e.target,
                  "passwordFieldLabel",
                  "passwordFieldInputBox"
                )
              }
            />
          </div>
        </div>

        <br />
        <div className="w-full mr-0 grid">
          <button type="submit" className="LoginButton">
            Login
          </button>
          <button
            onClick={handleForgotPassword}
            className="ResetPasswordLink"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Forgot your password? We've got you"}
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">Or sign in with</div>

        <div className="flex items-center justify-center space-x-4">
          <div className="w-full">
            <GoogleLoginButton onClick={handleContinueWithGoogle}>
              Google
            </GoogleLoginButton>
          </div>
        </div>
      </form>
    </div>
  );
}