import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const normalizeUserId = (userId) => {
  if (!userId) return null;
  if (typeof userId === "object") {
    return userId.uid || userId.email || null;
  }
  return userId;
};

// حفظ البيانات الطبية
export const saveMedicalData = async (userId, data) => {
  try {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) return;
    await setDoc(doc(db, "users", normalizedId, "medical", "data"), data, { merge: true });
    console.log("Medical data saved to Firebase ✅", data);
  } catch (e) {
    console.log("Error saving medical data:", e);
  }
};

// جلب البيانات الطبية
export const getMedicalData = async (userId) => {
  try {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) return null;
    const snap = await getDoc(doc(db, "users", normalizedId, "medical", "data"));
    console.log("Medical data fetched from Firebase:", snap.exists() ? snap.data() : null);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.log("Error getting medical data:", e);
    return null;
  }
};