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
import SettingScreen from './app/setting';
import SignInScreen from './app/sign_in';
import SplashScreenUI from './app/splash';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(undefined); // مهم: undefined
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    const init = async () => {
      try {
        const lang = await getLanguage();
        if (lang) i18n.locale = lang;
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    init();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u); // null = not logged, object = logged
    });

    return unsub;
  }, []);

  // 🔥 مهم جدًا: لا توقف التطبيق
  if (!appReady || user === undefined) {
    return (
      <NavigationContainer>
        <SplashScreenUI />
      </NavigationContainer>
    );
  }

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
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}