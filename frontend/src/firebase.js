import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API,
  authDomain: "aquamart-dde39.firebaseapp.com",
  projectId: "aquamart-dde39",
  storageBucket: "aquamart-dde39.firebasestorage.app",
  messagingSenderId: "479849136089",
  appId: "1:479849136089:web:0255582ae671ba072e23c8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;