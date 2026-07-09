import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase console se copy ki gayi keys yahan hain
const firebaseConfig = {
  apiKey: "AIzaSyCg-KEabCiM7_Mj8mVaMebFrSiXGVgA_yg",
  authDomain: "currexpro.firebaseapp.com",
  projectId: "currexpro",
  storageBucket: "currexpro.firebasestorage.app",
  messagingSenderId: "272532141115",
  appId: "1:272532141115:web:ffbc125e67fa1dae90181e",
};

// Firebase ko initialize karna
const app = initializeApp(firebaseConfig);

// Auth aur Firestore instances banana
const auth = getAuth(app);
const db = getFirestore(app);

// Baaki files mein use karne ke liye export karna
export { app, auth, db };