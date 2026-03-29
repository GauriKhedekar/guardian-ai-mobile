// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBakV0as8mpZ8MMvaf2Nkr-omF3hBgvcqE",
  authDomain: "guardian-ai-2bde4.firebaseapp.com",
  projectId: "guardian-ai-2bde4",
  storageBucket: "guardian-ai-2bde4.firebasestorage.app",
  messagingSenderId: "567801964529",
  appId: "1:567801964529:web:03deb9e28a700510ae8650"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Initialize Firestore
export const db = getFirestore(app);