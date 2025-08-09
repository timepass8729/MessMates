import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDGHpBzn6mKWVYImXFlkLBiJHoojHPNVCA",
  authDomain: "mealmanagement-53e76.firebaseapp.com",
  projectId: "mealmanagement-53e76",
  storageBucket: "mealmanagement-53e76.firebasestorage.app",
  messagingSenderId: "634356785506",
  appId: "1:634356785506:web:9a87b3850a0ad0c5608c3b",
  measurementId: "G-N59ZF0TE66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;