import React, { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { HiMiniStar } from 'react-icons/hi2';
import Confirmation from '../confirmation';
import {
  DirectionsRenderer,
  GoogleMap,
  LoadScript,
  Marker,
} from '@react-google-maps/api';
import Rating from '@/components/Rating';
import { Spinner } from '@/components/Spinner';

interface LocationData {
  lat: number;
  lng: number;
}



const RideDetails = () => {
  const router = useRouter();
  const { rideId } = router.query;
  const fetcher = (url: string) => axios.get(url).then(res => res.data);
  const { data: ride, error } = useSWR(
    rideId ? `/api/rides/${rideId}` : null, 
    fetcher, 
    { refreshInterval: 1000 }
  );
  const [mapLocation, setMapLocation] = useState<LocationData | null>(null);
  const [directions, setDirections] = useState(null);
  const [isMapsApiLoaded, setIsMapsApiLoaded] = useState(false);
  const [eta, setEta] = useState('');

  const mapRef = useRef();
  const driverIconUrl = "https://res.cloudinary.com/dxmrcocqb/image/upload/v1703094607/Haunted_House_Group_kxxb3v.png";



  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 });

  const { data: driverLocationData } = useSWR(ride?.driverId ? `/api/drivers/location/${ride.driverId}` : null, url => axios.get(url).then(res => res.data));

  const isValidLocation = (location: LocationData | null): location is LocationData => {
    return location !== null && !isNaN(location.lat) && !isNaN(location.lng);
  };
  

  useEffect(() => {
    if (driverLocationData) {
      setDriverLocation({
        lat: Number(driverLocationData.lat),
        lng: Number(driverLocationData.lng)
      });
    }
  }, [driverLocationData]);
  
  
  const renderDriverMarker = () => {
    if (typeof google !== "undefined" && isValidLocation(driverLocation)) {
      return (
        <Marker 
          position={driverLocation}
          icon={{
            url: driverIconUrl,
            scaledSize: new google.maps.Size(50, 50)
          }}
        />
      );
    }
    return null;
  };
  
  const fetchDirections = useCallback(async () => {
    if (isValidLocation(driverLocation) && isValidLocation(mapLocation) && isMapsApiLoaded) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: driverLocation,
        destination: mapLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          //@ts-ignore
          setDirections(result);
  
       //@ts-ignore
          const etaResult = result.routes[0].legs[0].duration.text;
          setEta(etaResult);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      });
    }
  }, [driverLocation, mapLocation, isMapsApiLoaded]);
  
  
  
  

  const geocodeAddress = async (address:string) => {
    try {
      const response = await axios.post('/api/geocode', { address });
      return response.data;
    } catch (error) {
      console.error('Error during geocoding:', error);
      throw error;
    }
  };


  useEffect(() => {
    const fetchLocation = async () => {
      if (ride && ride.status) {
        const location = ride.status === 'InProgress' ? ride.dropoffLocation : ride.pickupLocation;

        if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
          setMapLocation(location);
        } else if (typeof location === 'string') {
          try {
            const coords = await geocodeAddress(location);
            if (coords.lat && coords.lng) {
              setMapLocation(coords);
            } else {
              console.error('Geocoding returned invalid data:', coords);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
          }
        } else {
          console.error('Invalid location data:', location);
        }
      }
    };

    fetchLocation();
  }, [ride]);


  useEffect(() => {
    if (ride && ride.status) {
      const location = ride.status === 'InProgress' ? ride.dropoffLocation : ride.pickupLocation;
      setMapLocation(location);
    }
  }, [ride]);
  

  useEffect(() => {
    if (ride && mapLocation && mapRef.current) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: driverLocation,
        destination: mapLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          //@ts-ignore
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      });
    }
  }, [ride, mapLocation]);

  const onMapLoad = useCallback((map: any) => {
    mapRef.current = map;
    setIsMapsApiLoaded(true);
  }, []);

  useEffect(() => {
    if (isMapsApiLoaded) {
      fetchDirections();
    }
  }, [driverLocation, mapLocation, isMapsApiLoaded, fetchDirections]);
  
  
  

  const mapContainerStyle = {
    width: '100%',
    height: '55vh',
  };

  const mapOptions = {
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: false,
  };
    const cancelRide = async () => {
    try {
      await axios.post(`/api/rides/cancel/${rideId}`);
      alert("Ride has been canceled");
      router.push('/'); 
    } catch (cancelError) {
      console.error("Error cancelling ride:", cancelError);
    }
  };




  if (!ride && !error) return <Spinner />;
  if (error) return <p>Error: {error.message}</p>;

  if (ride?.status === 'Completed') {
    return <Rating rideId={ride.id} />;
  }

  return (
    <div className='relative h-full'>
      {ride ? (
        ride.driver ? (
          <div className="flex flex-col h-full">
            <div className="flex-grow relative">
              {eta && (
                <div className='absolute bottom-20 z-10 bg-white py-2 px-4 rounded-md flex ml-10'>
                  Your driver's ETA is {eta}
                </div>
              )}
              {mapLocation && (
                <LoadScript googleMapsApiKey={process.env.API_KEY || ""}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapLocation}
                    zoom={15}
                    onLoad={onMapLoad}
                    options={mapOptions}
                  >
                    {renderDriverMarker()}
                    <Marker position={mapLocation} label={ride.status === 'InProgress' ? "Dropoff" : "Pickup"} />
                    {directions && <DirectionsRenderer directions={directions} />}
                  </GoogleMap>
                </LoadScript>
              )}
            </div>
            <div className="relative z-10 bg-white py-4 px-4 rounded-t-lg flex flex-col max-w-[375px]">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <Image
                    src={ride.driver.photoUrl || "https://res.cloudinary.com/dxmrcocqb/image/upload/v1700749220/Social_Media_Chatting_Online_Blank_Profile_Picture_Head_And_Body_Icon_People_Standing_Icon_Grey_Background_generated_qnojdz.jpg"}
                    alt="driver"
                    width={60}
                    height={60}
                    className="rounded-full border"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">{ride.driver.rating.toFixed(1)}</span>
                    <HiMiniStar className="ml-1 text-yellow-500" />
                  </div>
                </div>
                <Image
                  src={ride.driver.carImageUrl}
                  alt="car"
                  width={180}
                  height={180}
                  className="rounded-lg"
                />
                <div className="ml-4">
                  <p className="text-gray-500 text-lg">{ride.driver.name?.split(" ")[0]}</p>
                  <p className="font-bold text-xl">{ride.driver.licensePlate}</p>
                  <p className="text-gray-500 text-lg">{ride.driver.carType}</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full mt-4">
                <a href="https://wa.me/12428221495" className="flex flex-col items-center">
                  <div>Customer Service</div>
                  <p className="underline text-blue-400 text-lg">822-1495</p>
                </a>
                <button className="bg-red-500 py-2 px-4 rounded-md text-white" onClick={cancelRide}>Cancel Ride</button>
              </div>
            </div>
          </div>
        ) : (
          <Confirmation />
        )
      ) : (
        <p>No ride details available.</p>
      )}
    </div>
  );
};

export default RideDetails;
