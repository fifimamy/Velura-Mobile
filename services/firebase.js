import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const firebaseConfig = {
  apiKey: "AIzaSyAiVkqfc1yhVgdlqafkNVOlQ6n45jvHZyk",
  authDomain: "velura-medical.firebaseapp.com",
  projectId: "velura-medical",
  storageBucket: "velura-medical.firebasestorage.app",
  messagingSenderId: "165269663541",
  appId: "1:165269663541:web:22156a3ac50e0406e6267c",
  measurementId: "G-9C35DBBHS2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);