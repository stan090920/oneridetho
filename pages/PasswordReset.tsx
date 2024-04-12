import React, { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import logo from "@/assets/oneridetho_logo_600ppi.png";
import { useRouter } from 'next/router';

export default function PasswordReset() {
  const { email } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter(); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      //Send a request to the backend to update the password
      const response = await axios.put('/api/reset', {
        email,
        newPassword,
      });
      // Check if the request was successful
        if (response.status === 200) {
          // Redirect the user to the login page upon successful password reset
          router.push('/auth/login');
        } else {
          // Handle unsuccessful response (if necessary)
          console.error('Password reset failed:', response.data);
          setErrorMessage('Failed to reset password. Please try again.');
        }
    } catch (error) {
      // Handle error response
      console.error('Error resetting password:', error);
      setErrorMessage('Failed to reset password. Please try again.');
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
    <div className="FormContainer mb-7">
        <form onSubmit={handleSubmit} className="LoginForm space-y-4">
            <div className='text-center flex justify-center'>
                <Image src={logo} alt='logo' width={330} height={255} draggable="false"/>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Change Password
            </h2>
            <div className='InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full'>
                <label
                    htmlFor="password" id="passwordFieldLabel" className="Label"
                >
                    New Password
                </label>
                <div id="passwordFieldInputBox" className="InputBox">
                    <input
                        type="password" required
                        name="password"
                        id="password"
                        className="StandardInput"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onFocus={() => onFocusHandler('passwordFieldLabel', 'passwordFieldInputBox')}
                        onBlur={(e) => restoreDefaultLabelStyles(e.target, 'passwordFieldLabel', 'passwordFieldInputBox')}
                    ></input>
                </div>
            </div>
            <div className='InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full'>
                <label
                    htmlFor="confirm-password" id="confirmPasswordFieldLabel" className="Label"
                >
                    Confirm Password
                </label>
                <div id="confirmPasswordFieldInputBox" className="InputBox">
                    <input
                        type="password" required
                        name="confirm-password"
                        id="confirm-password"
                        className="StandardInput"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => onFocusHandler('confirmPasswordFieldLabel', 'confirmPasswordFieldInputBox')}
                        onBlur={(e) => restoreDefaultLabelStyles(e.target, 'confirmPasswordFieldLabel', 'confirmPasswordFieldInputBox')}
                    ></input>
                </div>
            </div>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                    id="newsletter"
                    aria-describedby="newsletter"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                    required
                    ></input>
                </div>
                <div className="ml-3 text-sm">
                    <label
                    htmlFor="newsletter"
                    className="font-light text-gray-500 dark:text-gray-300"
                    >
                    I accept the{' '}
                    <a
                        className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                        href="#"
                    >
                        Terms and Conditions
                    </a>
                    </label>
                </div>
            </div>
            <div className="flex flex-col space-y-5 items-center">
                <div className="w-2/3 mr-0 grid">
                    <button
                    type="submit"
                    className="LoginButton"
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </form>
    </div>
  );
}
