import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const normalizeUserId = (userId) => {
  if (!userId) return null;
  if (typeof userId === "object") {
    return userId.uid || userId.email || null;
  }
  return userId;
};

export const createAuthUser = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const signInAuthUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const sendPasswordReset = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const verifyResetCode = async (code) => {
  try {
    return await firebaseVerifyPasswordResetCode(auth, code);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const confirmPasswordResetCode = async (code, newPassword) => {
  try {
    return await confirmPasswordReset(auth, code, newPassword);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const saveUserLanguage = async (userId, language) => {
  try {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) return;
    await setDoc(doc(db, "users", normalizedId), { language }, { merge: true });
  } catch (e) {
    console.log("Error saving user language:", e);
  }
};

export const getUserLanguage = async (userId) => {
  try {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) return null;
    const snap = await getDoc(doc(db, "users", normalizedId));
    return snap.exists() ? snap.data()?.language || null : null;
  } catch (e) {
    console.log("Error fetching user language:", e);
    return null;
  }
};

// حذف بيانات المستخدم من Firebase
export const deleteUserData = async (userId) => {
  try {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) return;
    // حذف الدردشات
    const chatsRef = collection(db, "users", normalizedId, "chats");
    const chatsSnap = await getDocs(chatsRef);
    await Promise.all(chatsSnap.docs.map((chatDoc) => deleteDoc(chatDoc.ref)));

    // حذف البيانات الطبية
    await deleteDoc(doc(db, "users", normalizedId, "medical", "data"));

    // حذف المستند الرئيسي
    await deleteDoc(doc(db, "users", normalizedId));

    console.log("User data deleted from Firebase");
  } catch (e) {
    console.log("Error deleting user data:", e);
  }
};