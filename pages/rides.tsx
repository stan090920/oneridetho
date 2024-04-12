import React from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Rides = () => {
  const { data: rides, error } = useSWR('/api/rides', fetcher);

  if (error) return <div>Failed to load rides.</div>;
  if (!rides) return <div>Loading...</div>;

  return (
    <div className="px-5 mt-5">
      <div className="font-bold text-[24px] mb-4">Rides</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rides.map((ride: any, index: any) => (
          <div key={index} className="border p-4 rounded-lg shadow">
            <div className="font-semibold">{ride.user.name}</div>
            <p>Pickup: {ride.pickupLocation}</p>
            <p>Dropoff: {ride.dropoffLocation}</p>
            <p>Fare: ${ride.fare}</p>
            <p>Status: <span className={`text-${ride.status === 'Completed' ? 'green' : 'red'}-600`}>{ride.status}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rides;
