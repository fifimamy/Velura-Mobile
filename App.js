import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { SCREENS } from './app/constants';
import i18n from './i18n';
import { auth } from './services/firebase';
import { getLanguage } from './services/storage';

import * as SplashScreen from 'expo-splash-screen';

import ChatScreen from './app/chat';
import CreateAccountScreen from './app/create_account';
import ResetPasswordScreen from './app/reset_password';
import SettingScreen from './app/setting';
import SignInScreen from './app/sign_in';
import SplashScreenUI from './app/splash';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // 🔥 SPLASH CONTROL (مرة واحدة فقط)
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    const prepareApp = async () => {
      try {
        const savedLang = await getLanguage();
        if (savedLang) i18n.locale = savedLang;

        setAppReady(true);
      } catch (e) {
        console.log("Init error:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, []);

  // 🔥 AUTH LISTENER (Firebase هو مصدر الحقيقة)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  if (!appReady || loadingAuth) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {user ? (
          <>
            <Stack.Screen name={SCREENS.CHAT} component={ChatScreen} />
            <Stack.Screen name={SCREENS.SETTING} component={SettingScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name={SCREENS.SPLASH} component={SplashScreenUI} />
            <Stack.Screen name={SCREENS.SIGN_IN} component={SignInScreen} />
            <Stack.Screen name={SCREENS.CREATE_ACCOUNT} component={CreateAccountScreen} />
            <Stack.Screen name={SCREENS.RESET_PASSWORD} component={ResetPasswordScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}