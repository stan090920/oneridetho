import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import logo from "../../assets/oneridetho_logo_600ppi.png";
import axios from 'axios';
import { useAuth } from '@/components/AuthProvider';

export default function Login() {
  const { setOTP, email, setEmail } = useAuth();
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [loginError, setLoginError] = useState('');
  const [emailError, setEmailError] = useState("");


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
    // Check if email is provided
    if (!email) {
      alert("Please enter your email");
      return;
    }

    // Generate OTP
    const OTP = Math.floor(Math.random() * 9000 + 1000).toString();
    setOTP(OTP);

    // Check if email exists
    try {
      const emailExist = await checkEmailExists(email);
      if (!emailExist) {
        setEmailError("Email does not exist. Please Sign Up.");
        return;
      }
      else{
        setEmailError("");
      }
    } catch (error) {
      console.error("Error checking email existence:", error);
      setEmailError("Failed to check email existence. Please try again.");
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
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    navigateToOtp();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(''); 
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    });
  
    if (result && !result.error) {
      console.log('Signed in successfully!');
      router.push('/');
    } else if (result) {
      setLoginError('Email or password is incorrect');
    }
  };

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
    <div className='FormContainer'>
      <form onSubmit={handleSubmit} className='LoginForm space-y-4'>
        <div className='text-center flex justify-center'>
          <Image src={logo} alt='logo' width={330} height={255} draggable="false"/>
        </div>
        <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
          <label id="emailFieldLabel" className="Label">
            Email Address
          </label>
          <div id="emailFieldInputBox" className="InputBox">
            <input
              type="email"
              className="StandardInput"
              value={email}
              autoComplete='off'
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => onFocusHandler('emailFieldLabel', 'emailFieldInputBox')}
              onBlur={(e) => restoreDefaultLabelStyles(e.target, 'emailFieldLabel', 'emailFieldInputBox')}
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
              onFocus={() => onFocusHandler('passwordFieldLabel', 'passwordFieldInputBox')}
              onBlur={(e) => restoreDefaultLabelStyles(e.target, 'passwordFieldLabel', 'passwordFieldInputBox')}
            />
          </div>
        </div>

        <br/>
        <div className="w-full mr-0 grid">
          <button type="submit" className="LoginButton" >Login</button>
          <button onClick={handleForgotPassword} className="ResetPasswordLink">Forgot your password? We've got you</button>
        </div>
        {/* 
        <div className="mt-5">
            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
            className="bg-blue-400 py-3 pl-[100px] pr-[70px] text-white rounded-md  ">
              Login with Google
            </button>
          </div>
        */}
        {loginError && <div className="text-red-500">{loginError}</div>}
        {emailError && <div className="text-red-500">{emailError}</div>}
      </form>
    </div>
  );
}