import React, { useState } from "react";
import useSWR from "swr";
import ChatBox from "./ChatBox";
import SendMessage from "./SendMessage";
import { useSession } from "next-auth/react";

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

interface User {
  id: number;
  name: string;
  email: string;
  // Add other fields as needed
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ChatPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const { data: session } = useSession();

  const { data: rides, error } = useSWR<Ride[]>(session ? "/api/rides" : null, fetcher);

  const inProgressRides = Array.isArray(rides)
    ? rides.filter(
        (ride) =>
          ride.status === "InProgress" ||
          (ride.isAccepted &&
            (ride.status === "Requested" || ride.status === "Scheduled"))
      )
    : [];

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className="fixed bottom-5 left-5 bg-green-600 text-white rounded-full px-4 py-2 z-50"
        onClick={toggleChat}
        title="Toggle Chat"
      >
        Chat
      </button>
      {isOpen && (
        <div className="fixed bottom-5 left-5 w-11/12 sm:w-2/4 max-w-lg h-3/4 max-h-[80vh] bg-white rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center bg-green-600 text-white p-3 rounded-t-lg">
            <div>Chat</div>
            <button
              className="border border-gray-200 rounded-full p-1 hover:bg-gray-500 active:bg-gray-400"
              onClick={toggleChat}
              title="Toggle Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 h-full flex flex-col">
            <div className="flex space-x-2 mb-2 overflow-x-auto">
              {inProgressRides.map((ride) => (
                <button
                  key={ride.id}
                  className={`py-2 px-4 rounded-lg ${
                    selectedRideId === ride.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setSelectedRideId(ride.id)}
                >
                  Ride {ride.id}
                </button>
              ))}
            </div>
            <div className="p-4 h-[55vh] overflow-y-auto">
              {selectedRideId && <ChatBox rideId={selectedRideId} />}
            </div>
            <div className="absolute bottom-0 w-full bg-gray-200 shadow-lg">
              {selectedRideId && <SendMessage rideId={selectedRideId} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPanel;
