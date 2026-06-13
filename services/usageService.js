import AsyncStorage from '@react-native-async-storage/async-storage';

const LIMIT = 20;

export const getTodayKey = (userId) => {
  const date = new Date().toISOString().split('T')[0];
  return `usage_${userId}_${date}`;
};

export const getMessageCount = async (userId) => {
  const key = getTodayKey(userId);
  const value = await AsyncStorage.getItem(key);
  return value ? parseInt(value) : 0;
};

export const increaseMessageCount = async (userId) => {
  const key = getTodayKey(userId);
  const current = await getMessageCount(userId);
  const newValue = current + 1;
  await AsyncStorage.setItem(key, String(newValue));
  return newValue;
};

export const canSendMessage = async (userId) => {
  const count = await getMessageCount(userId);
  return count < LIMIT;
};

export const getRemainingMessages = async (userId) => {
  const count = await getMessageCount(userId);
  return LIMIT - count;
};