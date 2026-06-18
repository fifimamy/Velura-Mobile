import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { SCREENS } from './app/constants';
import i18n from './i18n';
import { getLanguage } from './services/storage';

import ChatScreen from './app/chat';
import CreateAccountScreen from './app/create_account';
import ResetPasswordScreen from './app/reset_password';
import SettingScreen from './app/setting';
import SignInScreen from './app/sign_in';
import SplashScreen from './app/splash';
import UserInformation from './app/user_information';


const Stack = createNativeStackNavigator();

export default function App() {
  const [lang, setLang] = useState("en");


  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await getLanguage();

      if (savedLang) {
        i18n.locale = savedLang;
        setLang(savedLang);
      }
    };

    loadLanguage();
  }, []);


  return (
    <NavigationContainer>
     <Stack.Navigator 
     screenOptions={{ headerShown: false }}
     initialRouteName={SCREENS.SIGN_IN}>

       <Stack.Screen name={SCREENS.SPLASH} component={SplashScreen} />
       <Stack.Screen name={SCREENS.SIGN_IN} component={SignInScreen} />
       <Stack.Screen name={SCREENS.CREATE_ACCOUNT} component={CreateAccountScreen} />
       <Stack.Screen name={SCREENS.RESET_PASSWORD} component={ResetPasswordScreen} />
       <Stack.Screen name={SCREENS.USER_INFO} component={UserInformation} />
       <Stack.Screen name={SCREENS.CHAT} component={ChatScreen} />
       <Stack.Screen name={SCREENS.SETTING} component={SettingScreen} />

     </Stack.Navigator>
   </NavigationContainer>
  );
}