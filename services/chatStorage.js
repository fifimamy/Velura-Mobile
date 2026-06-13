import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "VELURA_CHATS";

// جلب كل المحادثات
export const getChats = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("getChats error:", error);
    return [];
  }
};

// حفظ كل المحادثات
export const saveChats = async (chats) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(chats));
  } catch (error) {
    console.log("saveChats error:", error);
  }
};

// حذف كل البيانات (اختياري)
export const clearChats = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (error) {
    console.log("clearChats error:", error);
  }
};