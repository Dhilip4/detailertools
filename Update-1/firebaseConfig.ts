import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ---------------------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ---------------------------------------------------------------------------------
// To make the Forum work for real users:
// 1. Go to console.firebase.google.com
// 2. Create a project and add a Web App.
// 3. Paste the config values below.
// ---------------------------------------------------------------------------------

const firebaseConfig = {
  // Replace the strings below with your actual Firebase keys
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Logic to initialize Firebase only if keys are replaced
let app;
let db: any = null;
let auth: any = null;
let isConfigured = false;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        isConfigured = true;
        console.log("Firebase Connected Successfully");
    } else {
        console.warn("Firebase config missing. Forum running in Demo Mode.");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export { db, auth, isConfigured };