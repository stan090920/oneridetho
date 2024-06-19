import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  GoogleMap,
  LoadScript,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import useSWR from 'swr';
import { useRouter } from 'next/router';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const center = { lat: 25.0343, lng: -77.3963 };

interface Location {
  id: number;
  lat: number;
  lng: number;
}

interface DriverMapProps {
  driverIds: number[];
}

const mapOptions = {
  streetViewControl: false,
  scaleControl: false,
  mapTypeControl: false,
  panControl: false,
  zoomControl: false,
  rotateControl: false,
  fullscreenControl: false,
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useDriverLocation = (driverId: number) => {
  const { data, error } = useSWR<{ lat: number, lng: number }>(`/api/drivers/location/${driverId}`, fetcher);

  return {
    location: data,
    isLoading: !error && !data,
    isError: error
  };
};

interface DriverMapProps {
  driverIds: number[];
  isLoading: boolean;
}

const DriverMap = ({ driverIds }: DriverMapProps) => {
  const driverIconUrl = "https://res.cloudinary.com/dxmrcocqb/image/upload/v1703094607/Haunted_House_Group_kxxb3v.png";

  const [driverLocations, setDriverLocations] = useState<Location[]>([]);

  
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.API_KEY ?? "",
    libraries: ["geometry", "drawing"],
  });

  useEffect(() => {
    driverIds.forEach((id) => {
      fetch(`/api/drivers/location/${id}`)
        .then(response => response.json())
        .then(data => {
          if (data && !isNaN(data.lat) && !isNaN(data.lng)) {
            setDriverLocations(prevLocations => {

              const exists = prevLocations.some(loc => loc.id === id);
              if (!exists) {
                return [...prevLocations, { id, lat: data.lat, lng: data.lng }];
              }
              return prevLocations;
            });
          }
        })
        .catch(error => console.error('Error fetching location:', error));
    });
  }, [driverIds]);

  return (
    <>
      {!isLoaded && <div>Loading...</div>}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          options={mapOptions}
        >
          {driverLocations.map((location) => (
            <Marker
              key={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              icon={{
                url: driverIconUrl,
                scaledSize: new google.maps.Size(50, 50),
              }}
            />
          ))}
        </GoogleMap>
      )}
    </>
  );
};

const Confirmation = () => {
  const [timeLeft, setTimeLeft] = useState(300);
  const router = useRouter();
  const { rideId } = router.query;
  const [driverIds, setDriverIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDriverIds = async () => {
      try {
        const response = await fetch('/api/drivers/list');
        const data = await response.json();
        setDriverIds(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching driver IDs:', error);
      }
    };

    fetchDriverIds();
  }, []);

  const statusCheckInterval = useRef<ReturnType<typeof setInterval>>();

  const checkRideStatus = async () => {
    if (!rideId) return;

    try {
      const response = await axios.get(`/api/rides/${rideId}`);
      if (response.data.isAccepted) {
        clearInterval(statusCheckInterval.current);
        router.push(`/rides/${rideId}`);
      }
    } catch (error) {
      console.error('Error checking ride status:', error);
    }
  };

  useEffect(() => {
    if (timeLeft === 0) {
      checkRideStatus();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    statusCheckInterval.current = setInterval(checkRideStatus, 5000);

    return () => {
      clearInterval(intervalId);
      clearInterval(statusCheckInterval.current);
    };
  }, [timeLeft, rideId]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const timeUpMessage = timeLeft === 0 ? "We're still looking for your driver. Please hold on a moment longer." : `Estimated time to match you with a driver: ${formatTime()}`;

  const cancelRide = async () => {
    try {
      await axios.post(`/api/rides/cancel/${rideId}`);
      alert("Ride has been canceled");
      router.push('/');
    } catch (error) {
      console.error("Error cancelling ride:", error);
    }
  };

  return (
    <div className='flex flex-col h-screen text-center'>
      <div className='flex items-center justify-center top-0 w-full h-4/5 fixed overflow-hidden'>
        <div className="ProgressBarWrapper max-w-xl" data-progress-bar="true" data-show-progress-string="true" data-progress-text="Progress:">
          <div className="ProgressBar" data-progress-bar-visual="true" style={{ width: `${((300 - timeLeft) / 300) * 100}%`, transition: "width 1s ease-out 0s", backgroundColor: '#4CAF50', height: '10px' }}>
            <div className="ProgressIndicatorImage"></div>
          </div>
        </div>
      </div>

      {/* Information section */}
      <div className='fixed bottom-0 bg-white rounded-t-[8px] w-full py-5 px-0.5'>
        <h1>Your ride is confirmed. {timeUpMessage}</h1>
        <p>We appreciate your patience. You'll be notified as soon as a driver is matched to your ride.</p>
        <button className="bg-red-500 py-3 pl-2 pr-2 rounded-md text-white" onClick={cancelRide}>Cancel Ride</button>
      </div>

      {/* Driver Map */}
      {/*} <DriverMap driverIds={driverIds} isLoading={isLoading} /> */}
    </div>
  );
};

export default Confirmation;
