import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

export const setCurrentUser = async () => {
  // User state is now managed directly by Firebase Auth.
  return auth.currentUser || null;
};

export const getCurrentUser = async () => {
  return auth.currentUser || null;
};

export const logout = async () => {
  await signOut(auth);
};

export const saveUser = async(user) => {
    try{
        const jsonValue = JSON.stringify(user);
        await AsyncStorage.setItem('user',jsonValue);
    } catch (e){
        console.log("Error saving user:", e);
    }
};

export const getUser = async() => {
    try{
        const jsonValue = await AsyncStorage.getItem('user');
        return jsonValue != null? JSON.parse (jsonValue) : null;
    } catch (e){
        console.log ('Error getting user:', e);
    }
};

export const removeUser = async() => {
    try{
        await AsyncStorage.removeItem('user');
    } catch (e){
        console.log ('Error removing user:', e);
    }
};

export const saveLanguage = async(lang) => {
    try{
        const jsonValue = JSON.stringify(lang);
        await AsyncStorage.setItem('language',jsonValue);
    } catch (e){
        console.log("Error saving user:", e);
    }
};

export const getLanguage = async() => {
    try{
        const jsonValue = await AsyncStorage.getItem('language');
        return jsonValue ? JSON.parse(jsonValue) : "en";
    } catch (e){
        console.log ('Error getting user:', e);
    }
};

export const saveChatHistory = async(history) => {
    try{
        const jsonValue = JSON.stringify(history);
        await AsyncStorage.setItem('chatHistory',jsonValue);
    } catch (e){
        console.log("Error saving chat history:", e);
    }
};

export const getChatHistory = async() => {
    try{
        const jsonValue = await AsyncStorage.getItem('chatHistory');
        return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (e){
        console.log ('Error getting chat history:', e);
    }
};


