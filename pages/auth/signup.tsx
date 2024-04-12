import React, { useState } from "react";
import { signIn } from "next-auth/react";
import router, { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import logo from "/assets/oneridetho_logo_600ppi.png"
import { useAuth } from "@/components/AuthProvider";


type ContactProps = {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
};

const Contact: React.FC<ContactProps> = ({
  setEmail,
  setPassword,
  setPhoneNumber,
}) => {
  const [countryCode, setCountryCode] = useState("1242");
  const [phoneNumber, setPhoneNumberState] = useState("1242");
  const [emailError, setEmailError] = useState("");

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

  const handlePhoneNumberChange = (e: any) => {
    let inputNumber = e.target.value.slice(countryCode.length);
    if (inputNumber.length > 10 - countryCode.length) {
      inputNumber = inputNumber.slice(0, 11 - countryCode.length);
    }
    const fullPhoneNumber = countryCode + inputNumber;
    setPhoneNumberState(fullPhoneNumber);
    setPhoneNumber(fullPhoneNumber);
  };

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
      setEmailError("Email is already taken");
    } else {
      setEmailError("");
    }
  };

  const clearInputField = (
      inputElementId: string
  ) => {
    const inputElement = document.getElementById(inputElementId) as HTMLInputElement;

    if (inputElement) {
      inputElement.value = countryCode;
      inputElement.blur();
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

  const onFocusHandlerForInputWithActionIcon = (
    labelId: string, 
    inputBoxId: string, 
    actionIconId: string
    ) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.add('LabelPrimaryColour');
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.add('InputBoxWithActionIconSelected');
    }
    const actionIcon = document.getElementById(actionIconId);
    if (actionIcon) {
      actionIcon.classList.add('ActionIconPrimaryColour');
    }
  };
  
  const onBlurHandlerForInputWithActionIcon = (
    labelId: string, 
    inputBoxId: string, 
    actionIconId: string
    ) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.remove('LabelPrimaryColour');
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.remove('InputBoxWithActionIconSelected');
    }
    const actionIcon = document.getElementById(actionIconId);
    if (actionIcon) {
      actionIcon.classList.remove('ActionIconPrimaryColour');
    }
  };

  return (
    <div className="mt-3">
      <div className="space-y-5 ">

        <div className="FormHeader">
          <div className="ProgressBarWrapper" data-progress-bar="true" data-show-progress-string="true" data-progress-text="Progress:">
            <div className="ProgressBar" data-progress-bar-visual="true" style={{width: "0%", transition: "width 1s ease-out 0s"}}>
              <div className="ProgressIndicatorImage"></div>
            </div>
            <div className="ProgressBarText" data-progress-bar-text="true">
              <span>
                Progress:
              </span>
              <span>
                0%
              </span>
            </div>
          </div>
        </div>

        <div className='text-center flex justify-center'>
          <Image src={logo} alt='logo' width={198} height={153} draggable="false" />
        </div>

        <div>
          <div className="sm:text-[24px] text-[22px] text-black font-semibold">Create an Account</div>
          <br/>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label id="emailFieldLabel" className="Label">
              Email Address
            </label>
            <div id="emailFieldInputBox" className="InputBox">
              <input
                type="email"
                className="StandardInput"
                onChange={handleEmailChange}
                onFocus={() => onFocusHandler('emailFieldLabel', 'emailFieldInputBox')}
                onBlur={(e) => restoreDefaultLabelStyles(e.target, 'emailFieldLabel', 'emailFieldInputBox')}
                required
              />
              {emailError && (
                <div className="text-red-500 text-sm">{emailError}</div>
              )}
            </div>
          </div>
        </div>

        <br/>
        <div>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label id="standardInputLabelWithActionIcon2" className="LabelWithActionIcon">
              Phone Number
            </label>
            <div id="standardInputBoxWithActionIcon2" className="InputBoxWithActionIcon">
              <div className="ActionIconWrapper">
                <svg 
                  id="clearIconForInputWithActionIcon" focusable="false" aria-hidden="true" viewBox="2 2 20 20" role="button"
                  className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
                  onClick={() => clearInputField('phoneNumberInputBox')}
                  >
                  <title>Clear entry</title>
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z">
                  </path>
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
                id="phoneNumberInputBox" type="number" autoComplete="off" max={7}
                className="StandardInputWithActionIcon"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                onFocus={() => onFocusHandlerForInputWithActionIcon('standardInputLabelWithActionIcon2', 'standardInputBoxWithActionIcon2', 'clearIconForInputWithActionIcon')}
                onBlur={() => onBlurHandlerForInputWithActionIcon('standardInputLabelWithActionIcon2', 'standardInputBoxWithActionIcon2', 'clearIconForInputWithActionIcon')}
              />
            </div>
          </div>
        </div>

        <br/>
        <div>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label id="passwordFieldLabel" className="Label">
              Password
            </label>
            <div id="passwordFieldInputBox" className="InputBox">
              <input
                type="password"
                className="StandardInput"
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => onFocusHandler('passwordFieldLabel', 'passwordFieldInputBox')}
                onBlur={(e) => restoreDefaultLabelStyles(e.target, 'passwordFieldLabel', 'passwordFieldInputBox')}
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type BasicInfoProps = {
  setName: React.Dispatch<React.SetStateAction<string>>;
  setDob: React.Dispatch<React.SetStateAction<string>>;
  setGender: React.Dispatch<React.SetStateAction<string>>;
};

const BasicInfo: React.FC<BasicInfoProps> = ({
  setName,
  setDob,
  setGender,
}) => {
  const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.value = input.value.replace(/[^A-Za-z\s]/g, "");
    setName(input.value);
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

        <div className="FormHeader">
          <div className="ProgressBarWrapper" data-progress-bar="true" data-show-progress-string="true" data-progress-text="Progress:">
            <div className="ProgressBar" data-progress-bar-visual="true" style={{width: "50%", transition: "width 1s ease-out 0s"}}>
              <div className="ProgressIndicatorImage"></div>
            </div>
            <div className="ProgressBarText" data-progress-bar-text="true">
              <span>
                Progress:
              </span>
              <span>
                50%
              </span>
            </div>
          </div>
        </div>

        <div className='text-center flex justify-center'>
          <Image src={logo} alt='logo' width={198} height={153} draggable="false" />
        </div>

        <div className="sm:text-[24px] text-[22px] text-black font-semibold">Create an Account</div>

        <div>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label id="fullNameFieldLabel" className="Label">
              Full Name
            </label>
            <div id="fullNameFieldInputBox" className="InputBox">
              <input
                className="StandardInput"
                onChange={handleNameInput}
                onFocus={() => onFocusHandler('fullNameFieldLabel', 'fullNameFieldInputBox')}
                onBlur={(e) => restoreDefaultLabelStyles(e.target, 'fullNameFieldLabel', 'fullNameFieldInputBox')}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <div className="InputWithAnimatedLabel inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label id="dobFieldLabel" className="LabelWithActionIcon">
              Date of Birth
            </label>
            <div id="dobFieldInputBox" className="InputBox">
              <input
                type="date"
                className="StandardInput"
                onChange={(e) => setDob(e.target.value)}
                onFocus={() => onFocusHandler('dobFieldLabel', 'dobFieldInputBox')}
                onBlur={(e) => restoreDefaultLabelStyles(e.target, 'dobFieldLabel', 'dobFieldInputBox')}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="InputWithAnimatedLabel">
            <div id="genderFieldInputBox" className="InputBox">
              <label id="genderFieldLabel" className="LabelWithActionIcon" >
                Gender
              </label>
              <select
                className="GenderDropdown" id="Gender"
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Signup = () => {
  const [step, setStep] = useState(1);
  const { email, setEmail } = useState("");
  const { phoneNumber, setPhoneNumber } = useAuth();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");


  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const nextStep = async () => {
    if (step === 2) {
      const dobDate = new Date(dob);
      const currentDate = new Date();
      let age = currentDate.getFullYear() - dobDate.getFullYear();
      const m = currentDate.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && currentDate.getDate() < dobDate.getDate())) {
        age--;
      }

      if (age < 18) {
        setErrorMessage("You must be 18 years or older to sign up.");
        return;
      }

      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          name,
          dob,
          gender,
          phoneNumber,
        });

        if (result && result.error) {
          setErrorMessage(result.error);
        } else {
          router.push("/");
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      }
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="LoginSignupBackground FormContainer">
      <div className="SignUpForm">
        {step === 1 && (
          <Contact
            setEmail={setEmail}
            setPassword={setPassword}
            setPhoneNumber={setPhoneNumber}
          />
        )}
        {step === 2 && (
          <BasicInfo 
            setName={setName} 
            setDob={setDob} 
            setGender={setGender} 
          />
        )}

        <div className="w-full mr-0 grid">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="flex w-full">
            {step === 2 && (
              <a className="BackButton" onClick={previousStep}>
                &lt;
              </a>
            )}
            <button
              onClick={nextStep}
              className="LoginButton w-full"
            >
              {step === 2 ? "Sign Up" : "Continue"}
            </button>
          </div>

          <div className="CountdownTimerWrapper text-gray-900 font-normal leading-6 box-border border-0 text-base mb-4 text-center mt-2">
            <p className="CountdownTimer font-semibold leading-6 text-center box-border border-0 p-0 mb-4 text-gray-500 flex justify-center items-center text-xs">
              <svg 
                className="CountdownTimerIcon text-gray-500 font-normal leading-6 text-center text-sm box-border w-4 h-4 mr-1" 
                focusable="false" viewBox="0 0 12 12" aria-hidden="true" optly_change_2="">
                <path d="M6,0c0.4,0,0.8,0.4,0.8,0.8c0,0.4-0.4,0.8-0.8,0.8H5.6v0.8c0.9,0.1,1.7,0.5,2.3,1l0.5-0.5 c0.3-0.3,0.8-0.3,1.1,0c0.3,0.3,0.3,0.8,0,1.1L9,4.5c0.5,0.8,0.8,1.7,0.8,2.6c0,2.7-2.2,4.9-4.9,4.9C2.2,12,0,9.8,0,7.1 c0-2.4,1.8-4.5,4.1-4.8V1.5H3.8C3.3,1.5,3,1.2,3,0.8C3,0.4,3.3,0,3.8,0H6z M5.4,4.5c0-0.3-0.3-0.6-0.6-0.6c-0.3,0-0.6,0.3-0.6,0.6v3 c0,0.3,0.2,0.6,0.6,0.6c0.3,0,0.6-0.2,0.6-0.6V4.5z" optly_change_2="">
                </path>
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
