import Image from "next/image";
import logo from "../assets/logo.svg";
import Link from "next/link";
import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import React from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

const Navbar = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(session?.user?.image);
  const [isWebcamVisible, setIsWebcamVisible] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [viewProfilePic, setViewProfilePic] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);

  const isLoggedIn = session != null;

  useEffect(() => {
    if (session && !session.user.image) {
      setShowUploadPrompt(true);
    }
  }, [session]);

  const closeUploadPrompt = () => {
    setShowUploadPrompt(false);
  };

  const toggleProfileOptions = () => {
    setShowProfileOptions(!showProfileOptions);
    setViewProfilePic(false); 
  };

  const handleViewProfile = () => {
    setViewProfilePic(true);
    setShowProfileOptions(false);
  };

  const handleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    signOut();
  };


  const toggleWebcam = () => {
    setIsWebcamVisible(!isWebcamVisible);
    closeUploadPrompt();
  };


  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
  
      if (imageSrc) {
        const img = document.createElement('img');
        img.src = imageSrc;
  
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
         
          const desiredWidth = 500;
          const desiredHeight = 500;
  
          if (ctx) {
            canvas.width = desiredWidth;
            canvas.height = desiredHeight;
  
    
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, desiredWidth, desiredHeight);
  
            canvas.toBlob(blob => {
              if (blob) {
                const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
                handleFileUpload(file);
                setIsWebcamVisible(false); 
              }
            }, 'image/jpeg');
          }
        };
      }
    }
  }, [webcamRef]);
  
  const handleBookARideClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!isLoggedIn) {
      // Open the login page
      e.preventDefault();
      // Modify the login page URL as per your actual path
      window.location.href = "/auth/login";
    }
    else{
      window.location.href = "/"
    }
    // If logged in, no action needed as it's combined with the index page
  };
  
  

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/photo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.imageUrl);

        const updatedSession = await getSession();
        if (updatedSession) {
          updatedSession.user.image = data.imageUrl;
        }
      } else {
        console.error("Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setIsLoading(false);
    }
  };

 

  return (
    <div className="HeaderBar" >

      {showUploadPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="popup bg-white p-4 rounded">
            <p>Please upload a profile image.</p>
            <button onClick={toggleWebcam} className="py-2 px-4 bg-blue-500 text-white rounded-md mt-2">Upload Image</button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="popup bg-white p-4 rounded">
            <p>Uploading Photo. Please Wait...</p>
          </div>
        </div>
      )}

      {viewProfilePic && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50" onClick={() => setViewProfilePic(false)}>
          <div className="relative">
            <Image src={session?.user.image as string} alt="Profile Image" objectFit="contain" width={350} height={350} className="rounded-full" />
          </div>
        </div>
      )}


      {isWebcamVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="relative w-full h-full">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="absolute inset-0 object-cover w-full h-full"
            />
            <div className="absolute bottom-10 flex items-center justify-center w-full">
              <button onClick={capture} className="bg-white h-16 w-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 5a2 2 0 0 1 4 0v5a1 1 0 1 0 2 0V5a4 4 0 0 0-8 0v5a1 1 0 1 0 2 0V5zM7 13a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H8a1 1 0 0 1-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

<div className="ManagementItemsContainer">
  <div className="HomeBookApplySection">
    <Link href="/">
      <div>
        <Image className="LogoInHeader" src={logo} alt="one ride tho" draggable="false" height={50} width="132" decoding="async" data-nimg="1" />
      </div>
    </Link>
    <div className="BookApplyBtnGroupWrapper">
      <ul className="BookApplyBtnGroup">
        <a onClick={handleBookARideClick}>
          <li className="FullRideText TextGlow">Book A Ride</li>
          <li className="ShortRideText TextGlow">Ride</li>
        </a>
        <a href="https://whatsform.com/AnbVNN">
          <li className="FullApplyText">Apply To Drive</li>
          <li className="ShortApplyText">Apply</li>
        </a>
      </ul>
    </div>
  </div>
  <div className="SocialLinksSection">
    <a href="https://www.facebook.com/profile.php?id=100075942281898" className="social-icon">
      <span className="icon">
        <svg id="facebook-logo" fill="rgb(66,103,178)" stroke="rgb(129, 237, 105)" strokeWidth="0" viewBox="0 0 512 512" className="text-white hover:text-blue-600" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
          <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
        </svg>
      </span>
    </a>
    <a href="https://www.tiktok.com/@oneridetho?is_from_webapp=1&sender_device=pc" className="social-icon">
      <span className="icon">
        <svg id="tiktok-logo" stroke="rgb(129, 237, 105)" strokeWidth="0" viewBox="0 0 448 512" className="text-white hover:text-blue-600" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tiktok-logo-gradient">
              <stop offset="0%" id="stop-color1" />
              <stop offset="50%" id="stop-color2" />
              <stop offset="100%" id="stop-color3" />

            </linearGradient>
          </defs>
          <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
        </svg>
      </span>
    </a>
    <a href="https://www.instagram.com/oneridetho242/" className="social-icon">
      <span className="icon">
        <svg id="instagram-logo" stroke="rgb(129, 237, 105)" strokeWidth="0" viewBox="0 0 448 512" className="text-white hover:text-blue-600" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="instagram-logo-gradient">
              <stop offset="0%" id="ig-stop-color1" />
              <stop offset="25%" id="ig-stop-color2" />
              <stop offset="40%" id="ig-stop-color3" />
              <stop offset="65%" id="ig-stop-color4" />
              <stop offset="80%" id="ig-stop-color5" />
              <stop offset="95%" id="ig-stop-color6" />
            </linearGradient>
          </defs>
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z">
          </path>
        </svg>
      </span>
    </a>
  </div>
  <div className="SignupLoginSection">
    {!session ? (
      <>
        <Link href="/auth/signup">
          <button className="SignupInHeader Glow">
            Sign Up
          </button>
        </Link>

        <Link href="/auth/login">
          <button className="LoginInHeader">Login</button>
        </Link>
      </>
      ) : (
      <div className="flex items-center gap-3 relative">
        <div  onClick={toggleProfileOptions} className="cursor-pointer">
          <Image
            src={
              session.user?.image ||
              "https://res.cloudinary.com/dxmrcocqb/image/upload/v1700749220/Social_Media_Chatting_Online_Blank_Profile_Picture_Head_And_Body_Icon_People_Standing_Icon_Grey_Background_generated_qnojdz.jpg"
            }
            alt="pfp"
            height={50}
            width={50}
            className="rounded-full object-cover"
          />
        </div>


        <div onClick={handleDropdown} className="cursor-pointer bg-white py-2 pr-4 pl-4 text-black rounded-full">
          {session.user?.name}
        </div>

        {showProfileOptions && (
          <div className="absolute bg-white text-black p-2 rounded shadow sm:mt-[120px] mt-[160px] w-[60%]">
            <button onClick={handleViewProfile}>View Profile</button>
            <button onClick={toggleWebcam}>Upload Profile</button>
          </div>
        )}

        {dropdownOpen && (
          <div className="absolute bg-white p-2 rounded shadow sm:mt-[120px] mt-[160px] max-w-[200px] sm:w-auto sm:ml-[50px] ml-[80px]">
            <ul>
              {/*<Link href="/" onClick={handleBookARideClick}>
                <li className="text-black hover:bg-gray-200 w-full sm:hidden">
                  Book a Ride
                </li>
              </Link>*/}
              <Link href="https://whatsform.com/AnbVNN">
                <li className="text-black hover:bg-gray-200 w-full sm:hidden">
                  Drive
                </li>
              </Link>
              <Link href="/rides">
                <li className="text-black hover:bg-gray-200 w-full">
                  Rides
                </li>
              </Link>
              <button
                onClick={handleLogout}
                className="text-black hover:bg-gray-200 w-full text-left"
              >
                Logout
              </button>
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
</div>
</div>
  );
};

export default Navbar;
