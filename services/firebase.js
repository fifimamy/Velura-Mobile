import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAiVkqfc1yhVgdlqafkNVOlQ6n45jvHZyk",
  authDomain: "velura-medical.firebaseapp.com",
  projectId: "velura-medical",
  storageBucket: "velura-medical.firebasestorage.app",
  messagingSenderId: "165269663541",
  appId: "1:165269663541:web:22156a3ac50e0406e6267c",
  measurementId: "G-9C35DBBHS2"
};

// 2. Initialize App أولاً
const app = initializeApp(firebaseConfig);

// 3. Auth (React Native version فقط)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// 4. Firestore
export const db = getFirestore(app);