import { useEffect, useRef, useState } from "react";
import {
  useLoadScript,
  GoogleMap,
  DirectionsRenderer,
} from "@react-google-maps/api";
import router from "next/router";
import { useSession } from 'next-auth/react';
import Link from "next/link";
import { IoMdPerson } from "react-icons/io";
import Image from "next/image";
import dollar from "../assets/dollar-bill.png";

interface Coordinates {
  lat: number;
  lng: number;
}

const Estimate = () => {
  const [distance, setDistance] = useState<string | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [fare, setFare] = useState("");
  const [pickupClicked, setPickupClicked] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const { data: session } = useSession();
  const isLoggedIn = session != null;

  const [pickupCoordinates, setPickupCoordinates] =
    useState<Coordinates | null>(null);
  const [dropoffCoordinates, setDropoffCoordinates] =
    useState<Coordinates | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.API_KEY || "",
    libraries: ["places", "geocoding"],
  });

  const handlePickupClick = () => {
    handleCalculateDistance();
    setPickupClicked(true);
  };

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const calculateFare = (
    distance: number,
    passengers: number
  ): string => {
    const baseFare = 10;
    const ratePerMile = 2;
    const distanceCharge = distance * ratePerMile;
    const passengerCharge = (passengers - 1) * 2;

    const currentHour = new Date().getHours();
    const isNightFee = currentHour >= 23 && currentHour < 6;
    const nightFee = isNightFee ? 5 : 0;

    const totalFare = baseFare + distanceCharge + passengerCharge + nightFee;
    return totalFare.toFixed(2);
  };

  useEffect(() => {
    if (distance) {
      setFare(calculateFare(parseFloat(distance), passengers));
    }
  }, [passengers]);

  const handleCalculateDistance = () => {
    if (pickupInputRef.current && dropoffInputRef.current) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [pickupInputRef.current.value],
          destinations: [dropoffInputRef.current.value],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK" && response) {
            if (response.rows.length > 0 && response.rows[0].elements.length > 0) {
              const element = response.rows[0].elements[0];
              if (element.status === "OK" && element.distance) {
                const distanceInMiles = element.distance.value / 1609.34;
                setFare(calculateFare(distanceInMiles, passengers));
                setIsAvailable(true);
              } else {
                console.error("Invalid element status or distance is missing");
                setIsAvailable(false);
                setFare("");
              }
            } else {
              console.error("No elements in the response");
              setFare("");
            }
          } else {
            console.error("Error was: " + status);
            setFare("");
          }
        }
      );
    }
  };

  const handleBooking = () => {
    const pickupLocation = pickupInputRef.current?.value;
    const dropoffLocation = dropoffInputRef.current?.value;

    if (pickupLocation && dropoffLocation) {
      localStorage.setItem(
        "rideDetails",
        JSON.stringify({
          pickup: pickupLocation,
          dropoff: dropoffLocation,
          fare: fare,
          passengers: passengers,
        })
      );

      router.push({
        pathname: "/checkout",
        query: {
          pickup: pickupLocation,
          dropoff: dropoffLocation,
          fare: fare,
          passengers: passengers,
        },
      });
    }
  };

  useEffect(() => {
    if (!isLoaded || !pickupInputRef.current || !dropoffInputRef.current) {
      console.error("Google Maps JavaScript API not loaded or error occurred");
      return;
    }

    const pickupAutocomplete = new window.google.maps.places.Autocomplete(
      pickupInputRef.current,
      {
        strictBounds: true,
        componentRestrictions: { country: "BS" },
      }
    );

    const dropoffAutocomplete = new window.google.maps.places.Autocomplete(
      dropoffInputRef.current,
      {
        strictBounds: true,
        componentRestrictions: { country: "BS" },
      }
    );

    pickupAutocomplete.addListener("place_changed", () => {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        setPickupCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    dropoffAutocomplete.addListener("place_changed", () => {
      const place = dropoffAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        setDropoffCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(pickupAutocomplete);
      window.google.maps.event.clearInstanceListeners(dropoffAutocomplete);
    };
  }, [isLoaded]);

  useEffect(() => {
    if (router.query.editing) {
      const savedDetails = localStorage.getItem("rideDetails");
      if (savedDetails) {
        const details = JSON.parse(savedDetails);
        if (details.pickup && pickupInputRef.current)
          pickupInputRef.current.value = details.pickup;
        if (details.dropoff && dropoffInputRef.current)
          dropoffInputRef.current.value = details.dropoff;
        if (details.fare) setFare(details.fare);
        if (details.passengers) setPassengers(details.passengers);
      }
    } else {
      localStorage.removeItem("rideDetails");
    }
  }, []);

  const reverseGeocode = (coordinates: Coordinates): Promise<string> => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: coordinates }, (results, status) => {
        if (status === "OK") {
          if (results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error("No results found"));
          }
        } else {
          reject(new Error("Geocoder failed due to: " + status));
        }
      });
    });
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(currentLocation);
          setPickupCoordinates(currentLocation);
          try {
            const address = await reverseGeocode(currentLocation);
            if (pickupInputRef.current) {
              pickupInputRef.current.value = address;
            }
          } catch (error) {
            console.error("Error getting address:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const clearPickupInput = () => {
    if (pickupInputRef.current) {
      pickupInputRef.current.value = "";
    }
  };

  // Define clearInputField and onChangeHandlerForInputWithActionIcon functions
  const clearInputField = (
      inputElementId: string,
      actionIconId1: string, 
      actionIconId2: string
  ) => {
    let inputElement: HTMLInputElement | null = null;

    if (inputElementId === 'pickupLocationInput') {
      inputElement = pickupInputRef.current;
    } else if (inputElementId === 'dropoffLocationInput') {
      inputElement = dropoffInputRef.current;
    }

    if (inputElement) {
      inputElement.value = '';
      inputElement.blur();
      onChangeHandlerForInputWithActionIcon(inputElement ,actionIconId1, actionIconId2);
    }
  };

  const onChangeHandlerForInputWithActionIcon = (
      inputElementId: HTMLInputElement,
      locationIconId: string, 
      clearIconId: string
  ) => {
    let inputElement: HTMLInputElement | null = null;

    if (inputElementId.id === 'pickupLocationInput') {
      inputElement = pickupInputRef.current;
    } else if (inputElementId.id === 'dropoffLocationInput') {
      inputElement = dropoffInputRef.current;
    }

    const locationIcon = document.getElementById(locationIconId);
    const clearIcon = document.getElementById(clearIconId);

    if (!locationIcon || !clearIcon) {
      return;
    }

    const locationActionIconStyles = window.getComputedStyle(locationIcon);
    const clearActionIconStyles = window.getComputedStyle(clearIcon);

    const isLocationActionIconVisible =
      locationActionIconStyles.display != 'none' &&
      locationActionIconStyles.opacity != '0';
    const isClearActionIconVisible =
      clearActionIconStyles.display != 'none' &&
      clearActionIconStyles.opacity != '0';

    if (inputElement?.value.trim() === "") {
      if (!isLocationActionIconVisible) {
        locationIcon.style.display = "block";
        locationIcon.style.opacity = "1";
      }
      if (isClearActionIconVisible) {
        clearIcon.style.display = "none";
      }
    } else {
      if (!isClearActionIconVisible) {
        clearIcon.style.display = "block";
        clearIcon.style.opacity = "1";
      }
      if (isLocationActionIconVisible) {
        locationIcon.style.display = "none";
      }
    }
    
  };

  
  const onBlurHandlerForInputWithActionIcon = (
    labelId: string,
    inputBoxId: string,
    actionIconId1: string,
    actionIconId2: string
  ) => {
    const label = document.getElementById(labelId);
    if (label) {
      label.classList.remove('LabelPrimaryColour');
    }
    const inputBox = document.getElementById(inputBoxId);
    if (inputBox) {
      inputBox.classList.remove('InputBoxWithActionIconSelected');
    }
    const actionIcon1 = document.getElementById(actionIconId1);
    const actionIcon2 = document.getElementById(actionIconId2);
    if (actionIcon1 && actionIcon2) {
      const actionIcon1Styles = window.getComputedStyle(actionIcon1);
      const isActionIcon1Visible =
        actionIcon1Styles.display != 'none' &&
        actionIcon1Styles.opacity != '0';
      const actionIcon2Styles = window.getComputedStyle(actionIcon2);
      const isActionIcon2Visible =
        actionIcon2Styles.display != 'none' &&
        actionIcon2Styles.opacity != '0';

      if (isActionIcon1Visible) {
        actionIcon1.classList.remove('ActionIconPrimaryColour');
      }
      if (isActionIcon2Visible) {
        actionIcon2.classList.remove('ActionIconPrimaryColour');
      }
    }
  };

  
  const onFocusHandlerForInputWithActionIcon = (
    labelId: string,
    inputBoxId: string,
    actionIconId1: string,
    actionIconId2: string
    ) => {
    const label = document.getElementById(labelId);
      if (label) {
        label.classList.add('LabelPrimaryColour');
      }
      const inputBox = document.getElementById(inputBoxId);
      if (inputBox) {
        inputBox.classList.add('InputBoxWithActionIconSelected');
      }
      const actionIcon1 = document.getElementById(actionIconId1);
      const actionIcon2 = document.getElementById(actionIconId2);
      if (actionIcon1 && actionIcon2) {
        const actionIcon1Styles = window.getComputedStyle(actionIcon1);
        const isActionIcon1Visible =
          actionIcon1Styles.display != 'none' &&
          actionIcon1Styles.opacity != '0';
        const actionIcon2Styles = window.getComputedStyle(actionIcon2);
        const isActionIcon2Visible =
          actionIcon2Styles.display != 'none' &&
          actionIcon2Styles.opacity != '0';

        if (isActionIcon1Visible) {
          actionIcon1.classList.add('ActionIconPrimaryColour');
        }
        if (isActionIcon2Visible) {
          actionIcon2.classList.add('ActionIconPrimaryColour');
        }
      }
  };

  return (
    <div>
      <div className="space-y-4 max-w-[500px]">
        <div className="sm:pt-5 font-bold text-[18px]">Price Preview</div>

        <div>
          <div className="inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label id="pickupInputLabel" className="LabelWithActionIcon">
              Enter Pickup Location
            </label>
            <div id="pickupInputBox" className="InputBoxWithActionIcon">
              <div className="ActionIconWrapper">
                <svg
                  id="pickupLocationActionIcon" viewBox="0 0 24 24" fill="black" focusable="false" role="button"
                  className="font-normal text-base leading-6 inline-block fill-current text-current h-6 w-5 cursor-pointer"
                  style={{ color: 'green' }}
                  onClick={getUserLocation}
                  >
                  <title>Use current location</title>
                  <path d="M10.5 13.5.5 11 21 3l-8 20.5-2.5-10Z"></path>
                </svg>
                <svg 
                  id="pickupClearActionIcon" focusable="false" aria-hidden="true" viewBox="2 2 20 20" role="button"
                  style={{ display: 'none'}}
                  className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
                  onClick={() => clearInputField('pickupLocationInput','pickupLocationActionIcon', 'pickupClearActionIcon')}
                  >
                  <title>Clear entry</title>
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z">
                  </path>
                </svg>
              </div>
              <input
                id="pickupLocationInput"
                ref={pickupInputRef}
                placeholder=""
                className="StandardInputWithActionIcon"
                onFocus={() => onFocusHandlerForInputWithActionIcon('pickupInputLabel', 'pickupInputBox', 'pickupLocationActionIcon', 'pickupClearActionIcon')}
                onBlur={() => onBlurHandlerForInputWithActionIcon('pickupInputLabel', 'pickupInputBox', 'pickupClearActionIcon', 'pickupLocationActionIcon')}
                onChange={(e) => onChangeHandlerForInputWithActionIcon(e.target ,'pickupLocationActionIcon', 'pickupClearActionIcon')}
              />
            </div>
          </div>
        </div>

        <br/>
        <div>
          <div className="inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label id="dropoffInputLabel" className="LabelWithActionIcon">
              Enter Dropoff Location
            </label>
            <div id="dropoffInputBox" className="InputBoxWithActionIcon">
              <div className="ActionIconWrapper">
                <svg
                  id="dropoffLocationActionIcon" viewBox="0 0 24 24" fill="black" focusable="false" role="button"
                  className="font-normal text-base leading-6 inline-block fill-current text-current h-6 w-5 cursor-pointer"
                  style={{ color: 'green' }}
                  onClick={getUserLocation}
                  >
                  <title>Use current location</title>
                  <path d="M10.5 13.5.5 11 21 3l-8 20.5-2.5-10Z"></path>
                </svg>
                <svg 
                  id="dropoffClearActionIcon" focusable="false" aria-hidden="true" viewBox="2 2 20 20" role="button"
                  style={{ display: 'none'}}
                  className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
                  onClick={() => clearInputField('dropoffLocationInput','dropoffLocationActionIcon', 'dropoffClearActionIcon')}
                  >
                  <title>Clear entry</title>
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z">
                  </path>
                </svg>
              </div>
              <input
                id="dropoffLocationInput"
                ref={dropoffInputRef}
                placeholder=""
                className="StandardInputWithActionIcon"
                onFocus={() => onFocusHandlerForInputWithActionIcon('dropoffInputLabel', 'dropoffInputBox', 'dropoffLocationActionIcon', 'dropoffClearActionIcon')}
                onBlur={() => onBlurHandlerForInputWithActionIcon('dropoffInputLabel', 'dropoffInputBox', 'dropoffClearActionIcon', 'dropoffLocationActionIcon')}
                onChange={(e) => onChangeHandlerForInputWithActionIcon(e.target,'dropoffLocationActionIcon', 'dropoffClearActionIcon')}
              />
            </div>
          </div>
        </div>

        <br/>
        <div className="PricePreviewResult">
          <div className="flex">
            <Image src={dollar} alt="dollar" />
            <div className="m-1 text-xl font-semibold py-3.5 px-2.5">
              Ride Fare: ${fare}
            </div>
          </div>
          <div className="flex items-center gap-2 w-[26%]">
            <div>
              <IoMdPerson size={24} />
            </div>
            <div>
              <input 
              type="number"
              className="RequestedPassengerCount"
              value={passengers} min="1" max="4"
              onChange={(e) => {
                const newPassengerCount = Math.max(1, Math.min(4, parseInt(e.target.value)));
                setPassengers(newPassengerCount);
              }}
              />
            </div>
          </div>
        </div>

        <br/>
        <div>
          {pickupCoordinates && dropoffCoordinates && !isAvailable && (
            <div className="text-center text-red-600">
              <p>Ride unavailable for set pickup and dropoff locations.</p>
            </div>
          )}
          <div className="LoginPriceCheckButtonGroup w-full flex flex-col items-center m-0 p-0">
            <a 
              className="CheckPriceButton mt-3 block w-full py-2 px-4"
              onClick={handlePickupClick}
              >
                Check Price
            </a>
            <a 
              href="/auth/login"
              className="LoginButton mt-3 block w-full py-2 px-4"
              >
                Login & Book Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export { Estimate };
