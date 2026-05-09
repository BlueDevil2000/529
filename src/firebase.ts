import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2-wJzdNVHc3vaTJ_9Pg-eq_lIsl8fNH8",
  authDomain: "planner-e9b2a.firebaseapp.com",
  projectId: "planner-e9b2a",
  storageBucket: "planner-e9b2a.firebasestorage.app",
  messagingSenderId: "1035059289333",
  appId: "1:1035059289333:web:a1cca936222fcc3a89f9bc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);