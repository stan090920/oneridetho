import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import router, { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import logo from "/assets/oneridetho_logo_600ppi.png"
import { useAuth } from "@/components/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { emailRegex, passwordRegex } from "@/scripts/RegEx";
import { GoogleLoginButton } from "react-social-login-buttons";
import { useGoogleLogin } from "@react-oauth/google";


type ContactProps = {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  email: string;
};

const Contact: React.FC<ContactProps> = ({
  setEmail,
  email,
}) => {
  const [emailError, setEmailError] = useState("");
  const [emailLabelAnimated, setEmailLabelAnimated] = useState(false);

  useEffect(() => {
    // Check if there's already content in the email input on mount
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

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    const isEmailTaken = await checkEmailExists(emailValue);

    if (isEmailTaken) {
      setEmailError("Email taken");
    } else {
      setEmailError("");
    }

    // Update label animation state based on input content
    if (emailValue.trim() === "") {
      setEmailLabelAnimated(false);
    } else {
      setEmailLabelAnimated(true);
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
    <div className="mt-3">
      <div className="space-y-5 ">
        <div className="text-center flex justify-center pt-5">
          <Image
            src={logo}
            alt="logo"
            width={150}
            height={150}
            draggable="false"
          />
        </div>

        <div>
          <div className="sm:text-[24px] text-[22px] text-black font-semibold">
            Sign up
          </div>
          <br />
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
                onChange={handleEmailChange}
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
                required
              />
              {emailError && (
                <div className="text-red-500 text-sm">{emailError}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type BasicInfoProps = {
  setName: React.Dispatch<React.SetStateAction<string>>;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  name: string;
  phone: string;
};

const BasicInfo: React.FC<BasicInfoProps> = ({
  setName,
  setPhoneNumber,
  setPassword,
  password,
  name,
  phone,
}) => {
  const [countryCode, setCountryCode] = useState("1242");
  const [phoneNumber, setPhoneNumberState] = useState("1242");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [nameLabelAnimated, setNameLabelAnimated] = useState(false);
  const [passwordLabelAnimated, setPasswordLabelAnimated] = useState(false);

  useEffect(() => {
    // Check if there's already content in the email input on mount
    if (password.trim() !== "") {
      setPasswordLabelAnimated(true);
    }
  }, [password]);

  useEffect(() => {
    // Check if there's already content in the name input on mount
    if (name.trim() !== "") {
      setNameLabelAnimated(true);
    }
  }, [name]);

  const handleCountryChange = (e: any) => {
    const selectedCountry = e.target.value;
    const prefix =
      selectedCountry === "Bahamas"
        ? "1242"
        : selectedCountry === "United States"
        ? "1"
        : "";
    setCountryCode(prefix);
    setPhoneNumberState(prefix);
  };

  const checkPhoneNumberExists = async (phoneNumber: string) => {
    try {
      const response = await fetch(`/api/check-phone?phone=${phoneNumber}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.phoneExists;
    } catch (error) {
      console.error("Error fetching phone number:", error);
      return false;
    }
  };

  const handlePhoneNumberChange = async (e: any) => {
    let inputNumber = e.target.value.slice(countryCode.length);
    if (inputNumber.length > 10 - countryCode.length) {
      inputNumber = inputNumber.slice(0, 11 - countryCode.length);
    }
    const fullPhoneNumber = countryCode + inputNumber;
    setPhoneNumberState(fullPhoneNumber);
    setPhoneNumber(fullPhoneNumber);

    const isPhoneNumberTaken = await checkPhoneNumberExists(fullPhoneNumber);

    if (isPhoneNumberTaken) {
      setPhoneNumberError("Phone number in use");
      toast.error("Phone number in use");
    } else {
      setPhoneNumberError("");
    }
  };

  const clearInputField = (inputElementId: string) => {
    const inputElement = document.getElementById(
      inputElementId
    ) as HTMLInputElement;

    if (inputElement) {
      inputElement.value = countryCode;
      inputElement.blur();
    }
  };

  const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.value = input.value.replace(/[^A-Za-z\s]/g, "");
    setName(input.value);

    // Update label animation state based on input content
    if (input.value.trim() === "") {
      setNameLabelAnimated(false);
    } else {
      setNameLabelAnimated(true);
    }
  };

  const onFocusHandler = (labelId: string, inputBoxId: string) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.remove("Label");
      label.classList.add("AnimatedLabel");
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.add("InputBoxExtraShadow");
      inputBox.classList.add("InputBoxPrimaryBorderColour");
    }
  };

  const restoreDefaultLabelStyles = (
    inputElement: HTMLInputElement,
    labelId: string,
    inputBoxId: string
  ) => {
    const label = document.getElementById(labelId);
    const isInputFieldBlank = inputElement.value.trim() === "";
    if (isInputFieldBlank && label) {
      label.classList.remove("AnimatedLabel");
      label.classList.add("Label");
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.remove("InputBoxExtraShadow");
      inputBox.classList.remove("InputBoxPrimaryBorderColour");
    }
  };

  const onFocusHandlerForInputWithActionIcon = (
    labelId: string,
    inputBoxId: string,
    actionIconId: string
  ) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.add("LabelPrimaryColour");
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.add("InputBoxWithActionIconSelected");
    }
    const actionIcon = document.getElementById(actionIconId);
    if (actionIcon) {
      actionIcon.classList.add("ActionIconPrimaryColour");
    }
  };

  const onBlurHandlerForInputWithActionIcon = (
    labelId: string,
    inputBoxId: string,
    actionIconId: string
  ) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.remove("LabelPrimaryColour");
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.remove("InputBoxWithActionIconSelected");
    }
    const actionIcon = document.getElementById(actionIconId);
    if (actionIcon) {
      actionIcon.classList.remove("ActionIconPrimaryColour");
    }
  };

  return (
    <div className="mt-3">
      <div className="space-y-5 ">
        <div className="FormHeader">
          <div
            className="ProgressBarWrapper"
            data-progress-bar="true"
            data-show-progress-string="true"
            data-progress-text="Progress:"
          >
            <div
              className="ProgressBar"
              data-progress-bar-visual="true"
              style={{ width: "60%", transition: "width 1s ease-out 0s" }}
            >
              <div className="ProgressIndicatorImage"></div>
            </div>
            <div className="ProgressBarText" data-progress-bar-text="true">
              <span>Progress:</span>
              <span>60%</span>
            </div>
          </div>
        </div>

        <div className="text-center flex justify-center">
          <Image
            src={logo}
            alt="logo"
            width={150}
            height={150}
            draggable="false"
          />
        </div>

        <div>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label
              id="fullNameFieldLabel"
              className={
                nameLabelAnimated || name.trim() !== ""
                  ? "AnimatedLabel"
                  : "Label"
              }
            >
              Full Name
            </label>
            <div id="fullNameFieldInputBox" className="InputBox">
              <input
                className="StandardInput"
                value={name}
                onChange={handleNameInput}
                onFocus={() =>
                  onFocusHandler("fullNameFieldLabel", "fullNameFieldInputBox")
                }
                onBlur={(e) =>
                  restoreDefaultLabelStyles(
                    e.target,
                    "fullNameFieldLabel",
                    "fullNameFieldInputBox"
                  )
                }
                required
              />
            </div>
          </div>
        </div>

        <div>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label
              id="standardInputLabelWithActionIcon2"
              className="LabelWithActionIcon"
            >
              Phone Number
            </label>
            <div
              id="standardInputBoxWithActionIcon2"
              className="InputBoxWithActionIcon"
            >
              <div className="ActionIconWrapper">
                <svg
                  id="clearIconForInputWithActionIcon"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="2 2 20 20"
                  role="button"
                  className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
                  onClick={() => clearInputField("phoneNumberInputBox")}
                >
                  <title>Clear entry</title>
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
                </svg>
                <div className="CountryFlagElement">
                  <select
                    className="CountryFlagDropdown"
                    onChange={handleCountryChange}
                  >
                    <option value="Bahamas">🇧🇸</option>
                    <option value="United States">🇺🇸</option>
                  </select>
                </div>
              </div>
              <input
                id="phoneNumberInputBox"
                type="number"
                autoComplete="off"
                max={7}
                className="StandardInputWithActionIcon"
                value={phone}
                onChange={handlePhoneNumberChange}
                onFocus={() =>
                  onFocusHandlerForInputWithActionIcon(
                    "standardInputLabelWithActionIcon2",
                    "standardInputBoxWithActionIcon2",
                    "clearIconForInputWithActionIcon"
                  )
                }
                onBlur={() =>
                  onBlurHandlerForInputWithActionIcon(
                    "standardInputLabelWithActionIcon2",
                    "standardInputBoxWithActionIcon2",
                    "clearIconForInputWithActionIcon"
                  )
                }
              />
              {phoneNumberError && (
                <div className="text-red-500 text-sm">{phoneNumberError}</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label
              id="passwordFieldLabel"
              className={
                passwordLabelAnimated || password.trim() !== ""
                  ? "AnimatedLabel"
                  : "Label"
              }
            >
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
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type PhoneInfoProps = {
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
};

const PhoneInfo: React.FC<PhoneInfoProps> = ({
  setPhoneNumber,
  phone,
}) => {
  const [countryCode, setCountryCode] = useState("1242");
  const [phoneNumber, setPhoneNumberState] = useState("1242");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  
  const handleCountryChange = (e: any) => {
    const selectedCountry = e.target.value;
    const prefix =
      selectedCountry === "Bahamas"
        ? "1242"
        : selectedCountry === "United States"
        ? "1"
        : "";
    setCountryCode(prefix);
    setPhoneNumberState(prefix);
  };

  const checkPhoneNumberExists = async (phoneNumber: string) => {
    try {
      const response = await fetch(`/api/check-phone?phone=${phoneNumber}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.phoneExists;
    } catch (error) {
      console.error("Error fetching phone number:", error);
      return false;
    }
  };

  const handlePhoneNumberChange = async (e: any) => {
    let inputNumber = e.target.value.slice(countryCode.length);
    if (inputNumber.length > 10 - countryCode.length) {
      inputNumber = inputNumber.slice(0, 11 - countryCode.length);
    }
    const fullPhoneNumber = countryCode + inputNumber;
    setPhoneNumberState(fullPhoneNumber);
    setPhoneNumber(fullPhoneNumber);

    const isPhoneNumberTaken = await checkPhoneNumberExists(fullPhoneNumber);

    if (isPhoneNumberTaken) {
      setPhoneNumberError("Phone number in use");
      toast.error("Phone number in use");
    } else {
      setPhoneNumberError("");
    }
  };

  const clearInputField = (inputElementId: string) => {
    const inputElement = document.getElementById(
      inputElementId
    ) as HTMLInputElement;

    if (inputElement) {
      inputElement.value = countryCode;
      inputElement.blur();
    }
  };
  
  const onFocusHandlerForInputWithActionIcon = (
    labelId: string,
    inputBoxId: string,
    actionIconId: string
  ) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.add("LabelPrimaryColour");
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.add("InputBoxWithActionIconSelected");
    }
    const actionIcon = document.getElementById(actionIconId);
    if (actionIcon) {
      actionIcon.classList.add("ActionIconPrimaryColour");
    }
  };

  const onBlurHandlerForInputWithActionIcon = (
    labelId: string,
    inputBoxId: string,
    actionIconId: string
  ) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.remove("LabelPrimaryColour");
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.remove("InputBoxWithActionIconSelected");
    }
    const actionIcon = document.getElementById(actionIconId);
    if (actionIcon) {
      actionIcon.classList.remove("ActionIconPrimaryColour");
    }
  };

  return (
    <div className="mt-3">
      <div className="space-y-5 ">
        <div className="FormHeader"></div>
        <div className="text-center flex justify-center">
          <Image
            src={logo}
            alt="logo"
            width={150}
            height={150}
            draggable="false"
          />
        </div>

        <div className=" pt-20">
          <div className="text-center text-sm text-gray-600 pb-7">Please enter your phone number to proceed</div>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label
              id="standardInputLabelWithActionIcon2"
              className="LabelWithActionIcon"
            >
              Phone Number
            </label>
            <div
              id="standardInputBoxWithActionIcon2"
              className="InputBoxWithActionIcon"
            >
              <div className="ActionIconWrapper">
                <svg
                  id="clearIconForInputWithActionIcon"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="2 2 20 20"
                  role="button"
                  className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
                  onClick={() => clearInputField("phoneNumberInputBox")}
                >
                  <title>Clear entry</title>
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
                </svg>
                <div className="CountryFlagElement">
                  <select
                    className="CountryFlagDropdown"
                    onChange={handleCountryChange}
                  >
                    <option value="Bahamas">🇧🇸</option>
                    <option value="United States">🇺🇸</option>
                  </select>
                </div>
              </div>
              <input
                id="phoneNumberInputBox"
                type="number"
                autoComplete="off"
                max={7}
                className="StandardInputWithActionIcon"
                value={phone}
                onChange={handlePhoneNumberChange}
                onFocus={() =>
                  onFocusHandlerForInputWithActionIcon(
                    "standardInputLabelWithActionIcon2",
                    "standardInputBoxWithActionIcon2",
                    "clearIconForInputWithActionIcon"
                  )
                }
                onBlur={() =>
                  onBlurHandlerForInputWithActionIcon(
                    "standardInputLabelWithActionIcon2",
                    "standardInputBoxWithActionIcon2",
                    "clearIconForInputWithActionIcon"
                  )
                }
              />
              {phoneNumberError && (
                <div className="text-red-500 text-sm">{phoneNumberError}</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const Signup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);


  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      setStep(step + 1);
    }
    else if (step === 2) {
      if (!name.trim()) {
        toast.error("Name cannot be empty.");
        return;
      }

      if (!phoneNumber.trim()) {
        toast.error("Phone number cannot be empty.");
        return;
      }

      if (!passwordRegex.test(password)) {
        toast.error(
          "Password must contain at least 8 characters, one number and one special character"
        );
        return;
      }

      const loadingToastId = toast.loading("Signing up...");
      
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          name,
          phoneNumber,
          provider: "credentials",
        });

        toast.dismiss(loadingToastId);

        if (result && !result.error) {
          toast.success("Signed in successfully!");
          router.push("/");
        } else if (result) {
          if (result.error === "User already exists with Google. Please sign in with Google.") {
            toast.error(result.error);
          } else {
            toast.error("Email or password is incorrect");
          }
        }
      } catch (error) {
        toast.dismiss(loadingToastId);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unexpected error occured.");
        }
      }
    } else if (step === 3) {
      if (!phoneNumber.trim()) {
        toast.error("Phone number cannot be empty.");
        return;
      }

      const loadingToastId = toast.loading("Signing up with Google...");

      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          name,
          phoneNumber,
          photoUrl,
          provider: "google",
          password: email, // Using email as password for Google sign-up
        });

        toast.dismiss(loadingToastId);

        if (result && !result.error) {
          toast.success("Signed in successfully!");
          router.push("/");
        } else if (result) {
          toast.error("There was trouble signing you in with Google. Please try again.");
        }
      } catch (error) {
        toast.dismiss(loadingToastId);
        toast.error("Unexpected error occurred.");
      }
    } else {
      setStep(step + 1);
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

        setEmail(userData.data.email);
        setName(userData.data.name);
        setPhotoUrl(userData.data.picture);
        // Redirect to phone number input page
        setStep(3);
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


  return (
    <div className="FormContainer">
      <div className="w-full px-5" style={{ maxWidth: "400px" }}>
        {step === 1 && <Contact setEmail={setEmail} email={email} />}
        {step === 2 && (
          <BasicInfo
            setName={setName}
            setPhoneNumber={setPhoneNumber}
            setPassword={setPassword}
            name={name}
            phone={phoneNumber}
            password={password}
          />
        )}
        {step === 3 && (
          <PhoneInfo setPhoneNumber={setPhoneNumber} phone={phoneNumber} />
        )}

        <br />
        <div className="w-full mr-0 grid">
          <div className="flex w-full">
            {step > 1 && (
              <a className="BackButton" onClick={previousStep}>
                &lt;
              </a>
            )}
            <button onClick={nextStep} className="LoginButton w-full">
              {step === 2 || step === 3 ? "Sign Up" : "Continue"}
            </button>
          </div>

          {step == 1 && (
            <div className=" pt-5">
              <div className="text-center text-sm text-gray-600">Or</div>

              <div className="flex items-center justify-center space-x-4 pt-5">
                <div className="w-full">
                  <GoogleLoginButton onClick={handleContinueWithGoogle}>
                    Sign up with Google
                  </GoogleLoginButton>
                </div>
              </div>
            </div>
          )}

          <div className="CountdownTimerWrapper text-gray-900 font-normal leading-6 box-border border-0 text-base mb-4 text-center mt-2">
            <p className="CountdownTimer font-semibold leading-6 text-center box-border border-0 p-0 mb-4 text-gray-500 flex justify-center items-center text-xs">
              <svg
                className="CountdownTimerIcon text-gray-500 font-normal leading-6 text-center text-sm box-border w-4 h-4 mr-1"
                focusable="false"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path d="M6,0c0.4,0,0.8,0.4,0.8,0.8c0,0.4-0.4,0.8-0.8,0.8H5.6v0.8c0.9,0.1,1.7,0.5,2.3,1l0.5-0.5 c0.3-0.3,0.8-0.3,1.1,0c0.3,0.3,0.3,0.8,0,1.1L9,4.5c0.5,0.8,0.8,1.7,0.8,2.6c0,2.7-2.2,4.9-4.9,4.9C2.2,12,0,9.8,0,7.1 c0-2.4,1.8-4.5,4.1-4.8V1.5H3.8C3.3,1.5,3,1.2,3,0.8C3,0.4,3.3,0,3.8,0H6z M5.4,4.5c0-0.3-0.3-0.6-0.6-0.6c-0.3,0-0.6,0.3-0.6,0.6v3 c0,0.3,0.2,0.6,0.6,0.6c0.3,0,0.6-0.2,0.6-0.6V4.5z"></path>
              </svg>
              {step === 2 ? "20 seconds left..." : "It only takes a minute!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
