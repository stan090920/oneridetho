import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaWhatsapp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const VerificationPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [governmentIssuedId, setGovernmentIssuedId] = useState("");
  const [verificationPhotoUrl, setVerificationPhotoUrl] = useState("");
  const [fetchedGovernmentIssuedId, setFetchedGovernmentIssuedId] = useState("");
  const [fetchedVerificationPhotoUrl, setFetchedVerificationPhotoUrl] = useState("");
  const [verified, setVerified] = useState(true);

  const fetchVerificationDetails = async () => {
    if (session?.user) {
      try {
        const response = await fetch("/api/verification/getVerificationDetails");
        if (response.ok) {
          const data = await response.json();
          setFetchedGovernmentIssuedId(data.user.governmentIssuedId || "");
          setFetchedVerificationPhotoUrl(data.user.verificationPhotoUrl || "");
          setVerified(data.user.verified);
          console.log("Successfully fetched verification details!");
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

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadToast = toast.loading("Uploading photo...");

    try {
      const response = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Photo uploaded successfully!", { id: uploadToast });
        return data.imageUrl;
      } else {
        toast.error("Failed to upload photo", { id: uploadToast });
        return null;
      }
    } catch (error) {
      toast.error("Error uploading photo", { id: uploadToast });
      console.error("Error uploading photo:", error);
      return null;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setFileUrl: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = await handleFileUpload(file);
      if (imageUrl) {
        setFileUrl(imageUrl);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateToast = toast.loading("Updating verification details...");

    try {
      const response = await fetch("/api/verification/updateVerificationDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          governmentIssuedId,
          verificationPhotoUrl,
        }),
      });

      if (response.ok) {
        toast.success("Verification details updated successfully!", {
          id: updateToast,
        });
        fetchVerificationDetails(); // Fetch the updated details
      } else {
        toast.error("Failed to update verification details", {
          id: updateToast,
        });
      }
    } catch (error) {
      toast.error("Error updating verification details", { id: updateToast });
      console.error("Error updating verification details:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Customer Verification</h1>
      {!fetchedGovernmentIssuedId || !fetchedVerificationPhotoUrl ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-600">
            Please upload clear images of your government-issued ID and a
            verification photo for the safety of our drivers. This helps us
            ensure the safety and trustworthiness of our service.
          </p>
          <div>
            <label
              htmlFor="governmentIssuedId"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Government Issued ID
            </label>
            <div className="flex items-center w-full h-12 px-3 border border-gray-300 rounded-lg bg-gray-50">
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-900 cursor-pointer focus:outline-none"
                onChange={(e) => handleFileChange(e, setGovernmentIssuedId)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="verificationPhoto"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Verification Photo
            </label>
            <div className="flex items-center w-full h-12 px-3 border border-gray-300 rounded-lg bg-gray-50">
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-900 cursor-pointer focus:outline-none"
                onChange={(e) => handleFileChange(e, setVerificationPhotoUrl)}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
              !governmentIssuedId || !verificationPhotoUrl
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            } text-white`}
            disabled={!governmentIssuedId || !verificationPhotoUrl}
          >
            Submit
          </button>
        </form>
      ) : !verified ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Your verification details are being reviewed. This process usually
            takes a few minutes. If you have any questions or need faster
            verification, please contact us on WhatsApp:
          </p>
          <a
            href="https://wa.me/12428221495"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-lg font-semibold underline text-green-600"
          >
            <FaWhatsapp className="mr-2" />
            WhatsApp Us
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Your account is successfully verified. Thank you!
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn btn-neutral btn-sm text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
