import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc
} from "firebase/firestore";
import { db } from "./firebase";


const normalizeUserId = (userId) => {
  if (!userId) return null;
  if (typeof userId === "object") {
    return userId.uid || userId.email || null;
  }
  return userId;
};

// حفظ محادثة واحدة
export const saveChat = async (userId, chat) => {
  try {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) return;
    await setDoc(
      doc(db, "users", normalizedId, "chats", chat.id),
      chat
    );
  } catch (e) {
    console.log(e);
  }
};

// حذف محادثة واحدة
export const deleteChat = async (userId, chatId) => {
  try {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) return;
    await deleteDoc(doc(db, "users", normalizedId, "chats", chatId));
    console.log("Chat deleted from Firebase");
  } catch (e) {
    console.log("Error deleting chat:", e);
  }
};

// جلب كل المحادثات
export const getChats = async (userId) => {
  try {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) return [];
    const snap = await getDocs(
      collection(db, "users", normalizedId, "chats")
    );

    return snap.docs.map(doc => doc.data());
  } catch (e) {
    console.log(e);
    return [];
  }
};

