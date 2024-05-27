import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/router';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

interface User {
  id: number;
  name: string;
  photoUrl: string;
  dob: string;
  email: string;
  gender: string;
  phone: string;
  rating: number;
}

interface Ride {
  id: number;
  pickupTime: string;
  dropoffTime: string | null;
  fare: number;
  tip: number;
  extraCharges: number;
  isAccepted: boolean;
  isConfirmed: boolean;
  isScheduled: boolean;
  passengerCount: number;
  paymentMethod: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  driverId: number;
  user: User;
}

// Function to format date and time
export const formatDateTime = (dateTimeString: string): string => {
  const dateTime = new Date(dateTimeString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(dateTime);
};

const Rides = () => {
  const { data: rides, error, mutate } = useSWR<Ride[]>('/api/rides', fetcher);
  const [showInProgress, setShowInProgress] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if there are any rides in progress
    if (rides && rides.some((ride: Ride) => ride.status === 'InProgress')) {
      setShowInProgress(true);
    }
  }, [rides]);

  if (error) return <div>Failed to load rides.</div>;
  if (!rides) return <div>Loading...</div>;

  // Filter rides based on status
  const rideInProgress = rides.find((ride: Ride) => ride.status === 'InProgress');
  const filteredRides = showInProgress
    ? rideInProgress ? [rideInProgress] : []
    : rides.filter((ride: Ride) => ride.status !== 'InProgress');

  const cancelRide = async (rideId: number) => {
    try {
      await axios.post(`/api/rides/cancel/${rideId}`);
      alert("Ride has been canceled");
      // Reload the page to reflect the change
      router.reload();
    } catch (error) {
      console.error("Error cancelling ride:", error);
    }
  };

  return (
    <div className="px-5 mt-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <button
            onClick={() => setShowInProgress(false)}
            className={`font-bold text-[24px] mr-4 ${!showInProgress ? 'text-blue-500' : ''}`}
          >
            Rides
          </button>
          <button
            onClick={() => setShowInProgress(true)}
            className={`font-bold text-[24px] ${showInProgress ? 'text-blue-500' : ''}`}
          >
            In-Progress
          </button>
        </div>
      </div>
      {filteredRides.length === 0 ? (
        <div className="flex justify-center items-center h-[70vh]">
          <div className="text-center font-bold text-[24px]">No Rides</div>
        </div>
      ) : (
        <div>
          {showInProgress && rideInProgress ? (
            <div className="border p-4 rounded-lg shadow">
              <div className="font-semibold">{rideInProgress.user.name}</div>
              <p>Pickup: {rideInProgress.pickupLocation}</p>
              <p>Dropoff: {rideInProgress.dropoffLocation}</p>
              <p>Fare: ${rideInProgress.fare}</p>
              <p>Status: <span className="text-red-600">{rideInProgress.status}</span></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRides.map((ride: Ride, index: number) => (
                <div key={index} className="border p-4 rounded-lg shadow">
                  <div className="font-semibold">{ride.user.name}</div>
                  <p>Pickup: {ride.pickupLocation}</p>
                  <p>Dropoff: {ride.dropoffLocation}</p>
                  <p>Fare: ${ride.fare}</p>
                  <p>Status: <span className={`${ride.status === 'Completed' ? 'text-green-600' : 'text-red-600'}`}>{ride.status}</span></p>
                  {ride.isScheduled && ride.status !== 'Cancelled' && (
                    <><p>Pickup Time: {formatDateTime(ride.pickupTime)}</p>
                    <button
                      onClick={() => cancelRide(ride.id)}
                      className="mt-2 bg-red-500 text-white py-1 px-3 rounded"
                    >
                      Cancel Ride
                    </button></>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Rides;
