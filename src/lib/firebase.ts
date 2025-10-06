import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA_bPqLKyLeGesVthc5OxZ-A7etRNNpNY8",
  authDomain: "mess-mates.firebaseapp.com",
  projectId: "mess-mates",
  storageBucket: "mess-mates.firebasestorage.app",
  messagingSenderId: "437479937588",
  appId: "1:437479937588:web:ed8e5b4d144fd356e39c61",
  measurementId: "G-BX11RFLQ7D"
};;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
