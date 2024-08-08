import { useRouter } from "next/router";
import { IoMdPerson } from "react-icons/io";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Spinner } from "@/components/Spinner";
import { toast } from "react-hot-toast";
import { storeUrl } from "../utils/utils";

interface Stop {
  lat: number;
  lng: number;
  address?: string; 
}

declare global {
  interface Window {
    paypal?: any; 
  }
}

type Driver = {
  id: number;
  email: string;
};

const Checkout = () => {
  const router = useRouter();
  const { pickup, dropoff, pickupCoordinates: pickupCoords, dropoffCoordinates: dropoffCoords, fare, passengers, stops: stopsQuery, isScheduled, pickupTime } = router.query;
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);
 
  const { data: session, status } = useSession();
  const [showProfilePhotoMessage, setShowProfilePhotoMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stopsWithAddress, setStopsWithAddress] = useState<Stop[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the formatted pickup time to avoid unnecessary recalculations
  const formattedPickupTime = useMemo(() => {
    if (typeof pickupTime === 'string') {
      const pickupDate = new Date(pickupTime);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      return new Intl.DateTimeFormat('en-US', options).format(pickupDate);
    }
    return null;
  }, [pickupTime]);

  // Utility function to generate random ID
  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  useEffect(() => {
    let stops: Stop[] = [];
    try {
      stops = stopsQuery ? JSON.parse(decodeURIComponent(stopsQuery as string)) : [];
    } catch (error) {
      console.error("Error parsing stops:", error);
    }

    const fetchAddresses = async () => {
      const updatedStops = await Promise.all(stops.map(async (stop) => {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${stop.lat},${stop.lng}&key=${process.env.API_KEY}`);
        const data = await response.json();
        return { ...stop, address: data.results[0]?.formatted_address };
      }));
      setStopsWithAddress(updatedStops);
    };

    fetchAddresses();
  }, [stopsQuery]);

  const handleEdit = () => {
    router.push("/book?editing=true");
  };

  const handleCardPayment = async (rideId: string, fare: string) => {
    const loadingToastId = toast.loading("Processing your payment...");

    try {
      const redirectUrl = `${window.location.origin}/checkout?${new URLSearchParams(router.query as any)}`;
      const urlId = await storeUrl(redirectUrl);
      const callbackUrl = `${window.location.origin}/api/payment/callback?token=${urlId}`;

      const paymentData = {
        orderId: rideId,
        currency: "BSD",
        amount: fare,
        redirectUrl: callbackUrl,
        callbackUrl: callbackUrl,
      };

      console.table(paymentData);

      const response = await axios.post("/api/payment/payment", paymentData);
      const { result } = response.data;

      toast.dismiss(loadingToastId);

      window.location.href = result;
    } catch (error) {
      console.error("Error during payment:", error);
      toast.dismiss(loadingToastId);
      toast.error(
        "Unexpected error occurred while processing your payment. Please try again later."
      );
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    if (!paymentMethod) {
      console.error('No payment method selected.');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch driver emails
      const driverEmailsResponse = await axios.get('/api/getDriversEmails');
      const driverEmails = driverEmailsResponse.data.map((driver: Driver) => driver.email);

      if (!isScheduled) {
        const bookingData = {
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          pickupCoordinates: JSON.parse(pickupCoords as string),
          dropoffCoordinates: JSON.parse(dropoffCoords as string),
          fare: fare,
          passengerCount: passengers,
          stops: stopsWithAddress,
          paymentMethod: paymentMethod,
          emails: driverEmails,
        };

        const response = await axios.post('/api/bookings', bookingData);
        const { rideId } = response.data;

        toast.success("Ride scheduled successfully");
        router.push(`/rides/${rideId}`);
        setIsLoading(false);
      } else {
        const scheduledBookingData = {
          userId: session?.user.id,
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          pickupCoordinates: JSON.parse(pickupCoords as string),
          dropoffCoordinates: JSON.parse(dropoffCoords as string),
          scheduledPickupTime: pickupTime,
          fare: fare,
          passengerCount: passengers,
          stops: stopsWithAddress,
          paymentMethod: paymentMethod,
          emails: driverEmails,
        };

        const response = await fetch("/api/schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scheduledBookingData),
        });

        if (response.ok) {
          toast.success("Ride scheduled successfully");
          setIsLoading(false);
          router.push('/'); 
          return;
        } else {
          setIsLoading(false);
          toast.error("Failed to schedule ride");
          console.error("Failed to schedule ride:", await response.text());
        }
      }

    } catch (error) {
      console.error('Error during booking:', error);
      toast.error("Unexpected error occurred while booking your ride. Please try again.");
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/photo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Photo uploaded successfully");
      } else {
        console.error("Failed to upload photo");
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !window.paypal) {
      loadPayPalSdk();
    }
  }, []);

  const handlePaymentMethodChange = (method: any) => {
    setPaymentMethod(method);
    setSelectedPaymentMethod(method);
    console.log("Selected payment method:", method);
  };

  const loadPayPalSdk = () => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLI}`;
    script.onload = () => {
      setPaypalSdkReady(true);
      renderPayPalButton();
    };
    document.body.appendChild(script);
  };

  const renderPayPalButton = () => {
    if (!window.paypal || !document.getElementById("paypal-button-container")) {
      console.error("PayPal button cannot be rendered yet.");
      return;
    }

    const paypalButtonContainer = document.getElementById("paypal-button-container");
    if (!paypalButtonContainer) {
      console.error("PayPal button container not found.");
      return;
    }

    if (paypalButtonContainer.childElementCount > 0) {
      return;
    }

    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: fare,
            },
          }],
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('Payment Successful:', details);
          setPaymentMethod('Card'); 
        });
      },
      onError: (err: any) => {
        console.error('Payment Error:', err);
      }
    }).render('#paypal-button-container');
  };

  useEffect(() => {
    if (paypalSdkReady) {
      renderPayPalButton();
    }
  }, [paypalSdkReady]);

  useEffect(() => {
    if (status === 'loading') return; 
    if (!session) {
      router.push('/auth/signup');
    } else if (!session.user.image) {
      setShowProfilePhotoMessage(true); 
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const cashPaymentMessages = (
    <div className="mt-5 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 sm:w-[500px]">
      <div className="font-bold">Note:</div>
      <p>Payment is required upon entry of vehicle.</p>
      <p>Drivers do not carry change.</p>
    </div>
  );

  const CardPaymentMessages = (
    <div className="mt-5 p-4 bg-blue-100 border border-blue-400 text-blue-700 sm:w-[500px]">
      <div className="font-bold">Note:</div>
      <p>You can pay automatically by clicking the button below.</p>
      <p>If you experience any trouble with the automatic payment, you can pay manually at <a href="https://external.kanoopays.com/payment/oneridetho" target="_blank" rel="noopener" className="text-blue-600 underline"> this link</a>.
      </p>
      <p>Remember the amount: ${fare} and download the receipt after payment.</p>
      <button 
        onClick={() => handleCardPayment(generateRandomId() , fare as string)}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Pay Now
      </button>
    </div>
  );

  return (
    <div className="px-2 mb-5">
      <h1 className="font-bold text-[30px]">Select Payment Method</h1>
      <div className="border rounded-md sm:w-[450px] w-[360px] max-h-[40vh] px-2 mt-5 pt-5 space-y-2 overflow-auto">
        <p className="font-bold">
          Pickup Location: <span className="font-normal">{pickup}</span>
        </p>
        <p className="font-bold">
          Dropoff Location: <span className="font-normal">{dropoff}</span>
        </p>
        {stopsWithAddress.map((stop, index) => (
          <p key={index} className="font-bold">
            Stop {index + 1}:
            <span className="font-normal">
              {stop.address || "Loading address..."}
            </span>
          </p>
        ))}
        {isScheduled && (
          <p className="font-bold">
            Pickup Time:{" "}
            <span className="font-normal">{formattedPickupTime}</span>
          </p>
        )}
        <p className="font-bold">
          Fare: $<span className="font-normal">{fare}</span>
        </p>
        <p className="flex items-center gap-4">
          <IoMdPerson size={24} /> {passengers}
        </p>
        <div className=" pb-2">
          <button
            onClick={handleEdit}
            className="py-1 bg-red-500 text-white px-4 rounded-md"
          >
            Edit Ride
          </button>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          className={`py-3 bg-green-500 text-white pl-4 pr-4 rounded-md mt-5 sm:w-auto w-full text-center ${
            selectedPaymentMethod === "Cash" ? "border-2 border-black" : ""
          }`}
          onClick={() => handlePaymentMethodChange("Cash")}
        >
          Pay with Cash
        </button>
        <button
          className={`py-3 bg-amber-500 text-white px-4 rounded-md mt-5 sm:w-auto w-full text-center ${
            selectedPaymentMethod === "Card" ? "border-2 border-black" : ""
          }`}
          onClick={
            () => handlePaymentMethodChange("Card")
            //handleCardPayment(generateRandomId(), fare as string)
          }
        >
          Pay with Card
        </button>
      </div>

      {paymentMethod === "Cash" && cashPaymentMessages}
      {paymentMethod === "Card" && CardPaymentMessages}

      {paymentMethod && (
        <div>
          <button
            className="py-3 bg-black text-white pl-12 pr-12 rounded-md mt-5 sm:w-[450px] w-[360px]"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Confirm Ride"}
          </button>
        </div>
      )}
      {showProfilePhotoMessage && (
        <div className="mt-5 p-4 bg-red-100 border border-red-400 text-red-700 sm:w-[50%]">
          <p>Please upload a valid photo to proceed.</p>
          <input
            type="file"
            id="fileUpload"
            className="mt-2"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
      )}
    </div>
  );
};

export default Checkout;
