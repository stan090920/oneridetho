import crypto from "crypto";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../scripts/Firebase";

// Function to store URL and return an ID
export const storeUrl = async (url: string) => {
  const id = crypto.randomBytes(16).toString("hex");
  console.log(`Storing URL with ID: ${id} | URL: ${url}`);

  try {
    await setDoc(doc(db, "urls", id), { url });
    return id;
  } catch (error) {
    console.error("Error storing URL in Firebase:", error);
    throw new Error("Failed to store URL");
  }
};

// Function to retrieve URL using the ID
export const retrieveUrl = async (id: string) => {
  try {
    const docRef = doc(db, "urls", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`Retrieving URL with ID: ${id} | Retrieved URL: ${data.url}`);
      return data.url;
    } else {
      console.log(`No URL found for ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving URL from Firebase:", error);
    throw new Error("Failed to retrieve URL");
  }
};