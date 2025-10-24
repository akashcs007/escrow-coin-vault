import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCJ5kTNtHVBmAySNxskC-sejx2h07KxyvI",
  authDomain: "spay-191ff.firebaseapp.com",
  projectId: "spay-191ff",
  storageBucket: "spay-191ff.firebasestorage.app",
  messagingSenderId: "237078619197",
  appId: "1:237078619197:web:77831f473393c8d9d87654",
  measurementId: "G-M7PM8E57ZB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
