import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const rawApiKey = import.meta.env.VITE_FIREBASE_API;
export const isFirebaseConfigured = Boolean(
  rawApiKey && 
  rawApiKey.trim() !== "" && 
  rawApiKey !== "AIzaSyDummyKeyForStartupSafeInitialization12345"
);

const firebaseConfig = {
  apiKey: rawApiKey || "AIzaSyDummyKeyForStartupSafeInitialization12345",
  authDomain: "aquamart-dde39.firebaseapp.com",
  projectId: "aquamart-dde39",
  storageBucket: "aquamart-dde39.firebasestorage.app",
  messagingSenderId: "479849136089",
  appId: "1:479849136089:web:0255582ae671ba072e23c8",
};

let app = null;
let authInstance = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    authInstance = getAuth(app);
  } catch (error) {
    console.warn("⚠️ Firebase Auth initialization error:", error.message);
  }
}

export const auth = authInstance;
export default app;