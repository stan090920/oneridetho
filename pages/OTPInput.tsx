import { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '@/components/AuthProvider';

interface OTPInputProps {
  onNextStep: () => void;
}


export default function OTPInput({ onNextStep }: OTPInputProps){
    const { email, otp } = useAuth();
    const [timerCount, setTimerCount] = useState(60);
    const [otpInput, setOTPInput] = useState(['', '', '', '']);
    const [disableResend, setDisableResend] = useState(false);

    const resendOTP = () => {
        if (disableResend) return;
        console.log(otp);
        
        axios
            .post('https://oneridetho.vercel.app/send_recovery_email', {
                OTP: otp,
                recipient_email: email,
            })
            .then(() => setDisableResend(true))
            .then(() => alert('A new OTP has been sent to your email.'))
            .then(() => setTimerCount(60))
            .catch(console.log);
        
    };

    const verifyOTP = () => {
        if (parseInt(otpInput.join('')) === parseInt(otp)) {
            console.log(otp);
            onNextStep();
        } else {
            alert('The code you have entered is not correct, try again or re-send the link');
        }
    };

    useEffect(() => {
        let interval = setInterval(() => {
        setTimerCount((prevCount) => {
            if (prevCount <= 1) {
            clearInterval(interval);
            setDisableResend(false);
            }
            return prevCount - 1;
        });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex justify-center items-center w-screen h-screen bg-gray-50">
            <div className="bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
                <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className="font-semibold text-3xl">
                            <p>Email Verification</p>
                        </div>
                        <div className="flex flex-row text-sm font-medium text-gray-400">
                            <p>We have sent a code to your email {email}</p>
                        </div>
                    </div>

                    <div>
                        <form>
                            <div className="flex flex-col space-y-16">
                                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                                {otpInput.map((digit, index) => (
                                    <div key={index} className="w-16 h-16 ">
                                    <input
                                        maxLength={1}
                                        className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-green-600"
                                        type="text"
                                        value={digit}
                                        onChange={(e) => {
                                        const newOtpInput = [...otpInput];
                                        newOtpInput[index] = e.target.value;
                                        setOTPInput(newOtpInput);
                                        }}
                                    ></input>
                                    </div>
                                ))}
                                </div>

                                <div className="flex flex-col space-y-5 items-center">
                                    <div className="w-2/3 mr-0 grid">
                                        <button
                                            onClick={verifyOTP}
                                            className="LoginButton"
                                        >
                                            Verify Account
                                        </button>
                                    </div>

                                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                                        <p>Didn't receive code?</p>{' '}
                                        <button
                                            className={`flex flex-row items-center ${disableResend ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 cursor-pointer'}`}
                                            onClick={resendOTP}
                                            disabled={disableResend}
                                        >
                                            {disableResend ? `Resend OTP in ${timerCount}s` : 'Resend OTP'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}