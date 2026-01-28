import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDx4rdQXaUhtKJ2gBW9-OABGQWu5OIAZq4",
    authDomain: "finboard-15be4.firebaseapp.com",
    projectId: "finboard-15be4",
    storageBucket: "finboard-15be4.firebasestorage.app",
    messagingSenderId: "1057833530514",
    appId: "1:1057833530514:web:b8100be32474281dc7a24b",
    measurementId: "G-P1VX74P207"
};

// Initialize Firebase (Singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only on client)
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, googleProvider, analytics };
