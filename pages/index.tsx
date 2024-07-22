import { Estimate } from "@/components/Estimate";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/router";
import bahamar from "../assets/bahamar.jpeg";
import atlantis from "../assets/atlantis.jpg";
import junk from "../assets/junkanoo.jpg";
import car from "../assets/car_image.jpg";
import DriversPhotoBlockPanel from "@/components/DriversPhotoBlockPanel";
import Book from "./book";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTime = 45;
  const endTime = 58;

  const [verified, setVerified] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  const isLoggedIn = session != null;

  const fetchVerificationDetails = async () => {
    if (session?.user) {
      try {
        const response = await fetch("/api/verification/getVerificationDetails");
        if (response.ok) {
          const data = await response.json();
          setVerified(data.user.verified);
        } else {
          console.error("Failed to fetch verification details");
        }
      } catch (error) {
        console.error("Error fetching verification details:", error);
      }
    }
  };

  useEffect(() => {
    fetchVerificationDetails();
  }, [session]);

  const navigateToVerificationPage = () => {
    router.push("/VerificationPage");
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setStartTime = () => {
      if (video.readyState >= 3) {
        video.currentTime = startTime;
        video.play();
      }
    };

    const checkTimeAndLoop = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        video.play();
      }
    };

    video.addEventListener("loadeddata", setStartTime);
    video.addEventListener("timeupdate", checkTimeAndLoop);

    if (video.readyState >= 3) {
      setStartTime();
    }

    return () => {
      if (video) {
        video.removeEventListener("loadeddata", setStartTime);
        video.removeEventListener("timeupdate", checkTimeAndLoop);
      }
    };
  }, [startTime, endTime]);

  return (
    <>
      <section className="TopSection">
        <div className="InnerTopSection">
          <div className="ChildOfInnerTopSection">
            <div className="MainContainerTopSection">
              <div className="WrapperOfFormAndDriversPanel">
                <div className={`BookingsForm ${isLoggedIn ? "loggedIn" : ""}`}>
                  {isLoggedIn && !verified && (
                    <div role="alert" className="alert alert-warning">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>
                        {" "}
                        Warning: Your account is not yet verified. You will not
                        be able to book rides.
                      </span>
                      <div>
                        <button
                          className="btn btn-sm"
                          onClick={navigateToVerificationPage}
                        >
                          Verify Now
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div>
                      <div>
                        <div>
                          <div>
                            <h1>Fast. Reliable. Convenient.</h1>
                          </div>
                        </div>
                      </div>
                      <div className="HideOnMobile">
                        <div>
                          <div>
                            <p className="BookingPrompt">
                              Book a ride, nice and quick!
                            </p>
                            <p className="AdvertisementDetails">
                              Open 24/7 - Prices starting at $10
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <br />
                  {isLoggedIn ? (
                    <>
                      <Book />
                    </>
                  ) : (
                    <>
                      <Estimate />
                    </>
                  )}
                </div>
                {!isLoggedIn && (
                  <div className="DriversPanelWrapper">
                    <DriversPhotoBlockPanel />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="MiddleSection">
        <div className="InnerTopSection">
          <div className="ChildOfInnerTopSection">
            <div className="MainContainerTopSection p-0 m-0 pb-0">
              <div className="WrapperOfFormAndDriversPanel">
                <div className="CarImageWrapper">
                  <Image src={car} alt="car" />
                </div>

                <div className="JoinTheTeamWrapper">
                  <div>
                    <div>
                      <div>
                        <div>
                          <div>
                            <h1>Join the team</h1>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div>
                          <div>
                            <h1 style={{ color: "rgb(20, 110, 0)" }}>
                              Start Earning Now
                            </h1>
                            <p
                              className="AdvertisementDetails"
                              style={{ color: "rgb(20, 110, 0)" }}
                            >
                              Join our crew of passionate drivers and make 70%
                              on every ride.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ApplyNowButtonWrapper">
                    <a
                      id="login-link"
                      href="https://whatsform.com/AnbVNN"
                      className="ApplyNowButton"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="BottomSection HideOnMobile">
        <div className="InnerTopSection">
          <div className="ChildOfInnerTopSection">
            <div className="MainContainerTopSection">
              <div className="WrapperOfFormAndDriversPanel">
                <div className="BahamasImages">
                  <Image src={bahamar} alt="places" />
                  <Image src={atlantis} alt="places" />
                  <Image src={junk} alt="places" />
                </div>
                <div className="SafetyInformation">
                  <div>
                    <div>
                      <div>
                        <div>
                          <div>
                            <h1>
                              Safest Transportation company in The Bahamas
                            </h1>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div>
                          <div>
                            <p className="BookingPrompt">
                              Safe, Affordable and Reliable Rides
                            </p>
                            <p
                              className="AdvertisementDetails"
                              style={{ color: "white" }}
                            >
                              Our transportation company is committed to
                              providing safe, reliable, and affordable services
                              to our customers.
                            </p>
                            <p
                              className="AdvertisementDetails"
                              style={{ color: "white" }}
                            >
                              Safety is our top priority, and we ensure that our
                              vehicles are regularly inspected and maintained to
                              the highest standards.
                            </p>
                            <p
                              className="AdvertisementDetails"
                              style={{ color: "white" }}
                            >
                              In addition to safety, we strive to offer reliable
                              services, ensuring that our vehicles arrive
                              promptly and are available for our customers'
                              convenience. Furthermore, we understand the
                              importance of affordability, and we have designed
                              our pricing structure to be competitive and
                              accessible to a wide range of customers. With our
                              transportation company, you can trust that your
                              journey will be safe, reliable, and affordable.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
        {/*<Mobilesoc />*/}
      </section>
    </>
  );
}
