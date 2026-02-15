// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD632vyXLhxpFQTeLTyswfybwxhOXjwKzw",
  authDomain: "budgetbookz-978b8.firebaseapp.com",
  projectId: "budgetbookz-978b8",
  storageBucket: "budgetbookz-978b8.firebasestorage.app",
  messagingSenderId: "776791453476",
  appId: "1:776791453476:web:9b13c7797079c2cccd0db1",
  measurementId: "G-HMWLZ5YHN4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional, only works in production)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
