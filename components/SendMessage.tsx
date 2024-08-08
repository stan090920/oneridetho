import React, { useState, FormEvent } from "react";
import { db } from "../scripts/Firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";

interface SendMessageProps {
  rideId: number;
  driverEmail: string;
}

const SendMessage: React.FC<SendMessageProps> = ({ rideId, driverEmail }) => {
  const [value, setValue] = useState("");
  const { data: session } = useSession();

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (value.trim() === "") {
      alert("Please enter a message");
      return;
    }

    try {
      if (session?.user) {
        const { id: uid, name: displayName, image: photoURL } = session.user;

        await addDoc(collection(db, "messages"), {
          text: value,
          name: displayName,
          avatar: photoURL,
          createdAt: serverTimestamp(),
          uid,
          rideId,
        });

        // Send email to the driver
        await fetch("/api/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient_email: driverEmail,
            subject: "New Message from Customer",
            text: `A new message has been sent regarding ride ID: ${rideId}. Please check your messages.`,
            html: `<p>A new message has been sent regarding ride ID: ${rideId}. Please check your messages.</p>`,
          }),
        });
      } else {
        alert("User session not found");
      }
    } catch (error) {
      console.error(error);
      setValue("");
    }

    setValue("");
  };

  return (
    <div className="relative bg-gray-200 w-full py-4 shadow-lg">
      <form onSubmit={handleSendMessage} className="flex px-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input w-full focus:outline-none bg-gray-100 rounded-l-lg text-black"
          type="text"
        />
        <button
          type="submit"
          className="w-auto bg-gray-500 text-white rounded-r-lg px-5 text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default SendMessage;
