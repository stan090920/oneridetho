import { useEffect, useRef, useState } from "react";
import {
  useLoadScript,
  GoogleMap,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import { IoMdPerson } from "react-icons/io";
import router from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import dollar from "../assets/dollar-bill.png";

interface Coordinates {
  lat: number;
  lng: number;
}

function SimpleMap({
    pickupCoordinates,
    dropoffCoordinates,
    stops,
  }: {
    pickupCoordinates: Coordinates | null;
    dropoffCoordinates: Coordinates | null;
    stops: Coordinates[];
  }) {
  const mapOptions = {
    fullscreenControl: false,
    mapTypeControl: false,
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.API_KEY || "",
    libraries: ["places", "geocoding"],
  });

  const [directionsResult, setDirectionsResult] = useState<any | null>(null);

  const directionsRendererOptions = {
    polylineOptions: {
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 5,
    },
  };

  useEffect(() => {
    if (pickupCoordinates && dropoffCoordinates) {
      const directionsService = new window.google.maps.DirectionsService();

      const waypoints = stops.map((stop) => ({
        location: new window.google.maps.LatLng(stop.lat, stop.lng),
        stopover: true,
      }));

      const request = {
        origin: pickupCoordinates,
        destination: dropoffCoordinates,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResult(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
          setDirectionsResult(null);
        }
      });
    }
  }, [pickupCoordinates, dropoffCoordinates, stops]);

  if (!isLoaded) return <div>Loading Map..</div>;

  return (
    <div className="sm:h-[78vh] sm:w-[100%] h-full w-full sm:relative fixed top-0 left-0 sm:z-[1] z-[-1]">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={{ lat: 25.06, lng: -77.345 }}
        zoom={13}
        options={mapOptions}
      >
        {directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={directionsRendererOptions}
          />
        )}

      </GoogleMap>
    </div>
  );
}

const Ride = () => {
  const [distance, setDistance] = useState<string | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [fare, setFare] = useState("");
  const [pickupClicked, setPickupClicked] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [scheduledPickupTime, setScheduledPickupTime] = useState("");
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [stops, setStops] = useState<Coordinates[]>([]);
  const stopInputRefs = useRef<HTMLInputElement[]>([]);

  const addStop = () => {
    if (!dropoffCoordinates) {
      alert("Please add a dropoff location first.");
      return;
    }
  
    if (stops.length < 3) {
      setStops([...stops, { lat: 0, lng: 0 }]);
    } else {
      alert("You can add up to 3 stops only.");
    }
  };
  

  const handleScheduleClick = () => {
    setShowScheduleInput(true);
  };

  const [pickupCoordinates, setPickupCoordinates] =
    useState<Coordinates | null>(null);
  const [dropoffCoordinates, setDropoffCoordinates] =
    useState<Coordinates | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.API_KEY || "",
    libraries: ["places"],
  });

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const calculateFare = (
    distance: number,
    passengers: number,
    stops: number
  ): string => {
    const baseFare = 10;
    const ratePerMile = 2;
    const distanceCharge = distance * ratePerMile;
    const passengerCharge = (passengers - 1) * 2;
    const stopCharge = stops * 1;

    const currentHour = new Date().getHours();
    const isNightFee = currentHour >= 23 || currentHour < 6;
    const nightFee = isNightFee ? 5 : 0;

    const totalFare = baseFare + distanceCharge + passengerCharge + nightFee + stopCharge;
    return totalFare.toFixed(2);
  };

  useEffect(() => {
    if (distance) {
      setFare(calculateFare(parseFloat(distance), passengers, stops.length));
    }
  }, [passengers, stops.length, distance]);

  const handleCalculateDistance = async () => {
    if (
      !pickupCoordinates ||
      !dropoffCoordinates ||
      stops.some((stop) => !stop.lat || !stop.lng)
    ) {
      console.error("Invalid coordinates for calculation");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    const waypoints = stops.map((stop) => ({
      location: new window.google.maps.LatLng(stop.lat, stop.lng),
      stopover: true,
    }));

    const request = {
      origin: new window.google.maps.LatLng(
        pickupCoordinates.lat,
        pickupCoordinates.lng
      ),
      destination: new window.google.maps.LatLng(
        dropoffCoordinates.lat,
        dropoffCoordinates.lng
      ),
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        //@ts-ignore
        const route = result.routes[0];
        let totalDistance = 0;

        route.legs.forEach((leg) => {
          if (leg.distance) {
            totalDistance += leg.distance.value;
          }
        });

        const distanceInMiles = totalDistance / 1609.34;
        setDistance(distanceInMiles.toFixed(2));
        setFare(calculateFare(distanceInMiles, passengers, stops.length));
      } else {
        console.error("Error calculating route:", status);
      }
    });
  };

  useEffect(() => {
    handleCalculateDistance();
  }, [pickupCoordinates, dropoffCoordinates, passengers, stops, stops.length]);

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
          stops,
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
          stops: encodeURIComponent(JSON.stringify(stops)),
        },
      });
    }
  };

  const { data: session } = useSession();

  const handleScheduleForLater = async () => {
    if (!pickupCoordinates || !dropoffCoordinates || !scheduledPickupTime) {
      alert("Please fill in all fields");
      return;
    }
    const pickupLocation = pickupInputRef.current?.value;
    const dropoffLocation = dropoffInputRef.current?.value;
    
    const rideDetails = {
      userId: session?.user.id,
      pickupLocation: pickupInputRef.current?.value,
      dropoffLocation: dropoffInputRef.current?.value,
      scheduledPickupTime,
      fare: fare,
      passengerCount: passengers,
      paymentMethod: "Cash",
    };

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rideDetails),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Scheduled ride successfully:", data);
    
        router.push({
          pathname: "/checkout",
          query: {
              pickup: pickupLocation,
              dropoff: dropoffLocation,
              fare: fare,
              passengers: passengers,
              stops: encodeURIComponent(JSON.stringify(stops)),
              isScheduled: true,
          },
      });
      } else {
        console.error("Failed to schedule ride:", await response.text());
      }
    } catch (error) {
      console.error("Error during scheduling:", error);
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

  useEffect(() => {
    if (!isLoaded) return;

    stopInputRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const autocomplete = new window.google.maps.places.Autocomplete(ref, {
        componentRestrictions: { country: "BS" },
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const updatedStops = [...stops];
          updatedStops[index] = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setStops(updatedStops);
        }
      });
    });
  }, [isLoaded, stops.length]);

  const assignRef = (element: HTMLInputElement | null, index: number) => {
    if (element) {
      stopInputRefs.current[index] = element;
    } else {
      stopInputRefs.current.splice(index, 1);
    }
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
              const formattedAddress = address.split(", ").slice(-2).join(", ");
              pickupInputRef.current.value = formattedAddress;
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

  const removeStop = (index: number) => {
    const newStops = stops.filter((_, stopIndex) => stopIndex !== index);
    setStops(newStops);
  };


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
    } else if (inputElementId === "stopLocationInput") {
      inputElement = stopInputRefs.current[0];
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
    } else if (inputElementId.id === "stopLocationInput") {
      inputElement = stopInputRefs.current[0];
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
    <div className="flex flex-wrap">
      <div className="w-full lg:w-1/2">
        <div className="space-y-4 max-w-[500px]">

          <div className="sm:pt-5 text-white font-bold text-[18px]">Book Your Ride</div>
          
          <div className="flex space-x-4">
            <div className="inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
              <label id="pickupInputLabel" className="LabelWithActionIcon">
                Enter Pickup Location
              </label>
              <div id="pickupInputBox" className="InputBoxWithActionIcon">
                <div className="ActionIconWrapper">
                  <svg
                    id="pickupLocationActionIcon" viewBox="0 0 24 24" fill="black" focusable="false" role="button"
                    className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
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

            <div className="AddStopButtonWrapper">
              <button onClick={addStop} className="AddStopButton">+</button>
            </div>
          </div>

          {stops.map((stop, index) => (
            <div key={index} className="flex space-x-4">
              <div className="inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
                <label id="stopInputLabel" className="LabelWithActionIcon">
                  Add a stop
                </label>
                <div id="stopInputBox" className="InputBoxWithActionIcon">
                  <div className="ActionIconWrapper">
                    <svg 
                      id="stopLocationActionIcon" viewBox="0 0 24 24" fill="black" focusable="false" role="button"
                      className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
                      onClick={getUserLocation}
                      >
                      <title>Use current location</title>
                      <path d="M10.5 13.5.5 11 21 3l-8 20.5-2.5-10Z"></path>
                    </svg>
                    <svg
                      id="stopClearActionIcon" focusable="false" aria-hidden="true" viewBox="2 2 20 20" role="button"
                      className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
                      style={{ display: 'none'}}
                      onClick={() => clearInputField('stopLocationInput', 'stopLocationActionIcon', 'stopClearActionIcon')}
                      >
                      <title>Clear entry</title>
                      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z">
                      </path>
                    </svg>
                  </div>
                  <input
                    id="stopLocationInput"
                    ref={(el) => assignRef(el, index)}
                    placeholder=""
                    className="StandardInputWithActionIcon"
                    onFocus={() => onFocusHandlerForInputWithActionIcon('stopInputLabel', 'stopInputBox', 'stopLocationActionIcon', 'stopClearActionIcon')}
                    onBlur={() => onBlurHandlerForInputWithActionIcon('stopInputLabel', 'stopInputBox', 'stopClearActionIcon', 'stopLocationActionIcon')}
                    onInput={(e) => onChangeHandlerForInputWithActionIcon(e.target as HTMLInputElement, 'stopLocationActionIcon', 'stopClearActionIcon')}
                  />
                </div>
              </div>

              <div className="RemoveStopButtonWrapper">
                <button onClick={() => removeStop(index)} className="RemoveStopButton">-</button>
              </div>
            </div>
          ))}

          <div className="inline-flex flex-col relative min-w-0 p-0 m-0 border-0 align-top w-full">
            <label id="dropoffInputLabel" className="LabelWithActionIcon">
              Enter Dropoff Location
            </label>
            <div id="dropoffInputBox" className="InputBoxWithActionIcon">
              <div className="ActionIconWrapper">
                <svg
                  id="dropoffLocationActionIcon" viewBox="0 0 24 24" fill="black" focusable="false" role="button"
                  className="font-normal text-base leading-6 inline-block fill-current text-current h-4 w-3.5 cursor-pointer"
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
          
          <br/>
          <div className="PricePreviewResult">
            <div className="flex">
              <Image src={dollar} alt="dollar" />
              <div className="m-1 text-base font-semibold py-3.5 px-2.5 text-white">
                Ride Fare: ${fare}
              </div>
            </div>
            <div className="flex items-center gap-2 w-[26%]">
              <div>
                <IoMdPerson size={24} style={{ color: 'white' }}/>
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

          {pickupCoordinates && dropoffCoordinates && fare && (
            <div className="LoginPriceCheckButtonGroup w-full flex flex-col items-center m-0 p-0">
              <div className="m-1 text-base font-semibold text-white w-full">
                Total Distance: {distance}
              </div>
              <button
                onClick={handleBooking}
                className="LoginButton mt-3 block w-full py-2 px-4"
              >
                Book Now
              </button>
              <button
                className="CheckPriceButton mt-3 block w-full py-2 px-4"
                onClick={handleScheduleClick}
              >
                Schedule for Later
              </button>
            </div>
          )}
          {showScheduleInput && (
            <div>
              <input
                type="datetime-local"
                value={scheduledPickupTime}
                onChange={(e) => setScheduledPickupTime(e.target.value)}
                className="outline-none bg-gray-200 py-3 pl-2 rounded-md"
              />
              <button
                onClick={handleScheduleForLater}
                className="py-2.5 bg-black text-white pl-4 pr-4 rounded-md ml-2 mt-2"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="SimpleMap w-full lg:w-1/2">
        <div className=" w-full h-full">
          <SimpleMap
            pickupCoordinates={pickupCoordinates}
            dropoffCoordinates={dropoffCoordinates}
            stops={stops}
          />
        </div>
      </div>
    </div>
  );
};
export { SimpleMap, Ride };
