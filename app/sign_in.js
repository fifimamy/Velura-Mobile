import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import {
  Alert,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { saveLanguage } from '../services/storage';
import { signInAuthUser } from '../services/userService';
import { SCREENS } from './constants';


export default function SingInScreen() {
  const navigation = useNavigation();
  
  const [lang, setLang] = useState(i18n.locale); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const toggleLanguage = async () => {
  const newLang = lang === "en" ? "fr" : "en";
  i18n.locale = newLang;
  setLang(newLang);
  await saveLanguage(newLang); 
  console.log("saved language:", newLang);
  };
  

  const handleLogin = async () => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      Alert.alert(i18n.t("Fill_all_fields"));
      return;
    }

    try {
      await signInAuthUser(normalizedEmail, normalizedPassword);
      Alert.alert(i18n.t("sign_in_done"));
      navigation.replace(SCREENS.CHAT);
    } catch (error) {
      console.log("AUTH LOGIN ERROR", error);

      if (error.code === 'auth/user-not-found') {
        Alert.alert(i18n.t("have't_account"));
        return;
      }

      if (error.code === 'auth/wrong-password') {
        Alert.alert(i18n.t("wrong_info"));
        return;
      }

      Alert.alert(i18n.t("wrong_info"));
      console.log(error.code);
      console.log(error.message);
    }
  };


  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const [loaded] = useFonts({
    Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
    PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-VariableFont_wght.ttf'),
    Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
    });


  const playSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/click.mp3'),
      { shouldPlay: true }
    );

    await sound.playAsync();

  } catch (error) {
    console.log("Sound Error:", error);
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2B2B2B" }}>
      <ImageBackground
        source={require('../assets/images/background2.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center", 
            alignItems: "center",     
            padding: 20,
          }}
        >

          {/* Title */}
          <Text
            style={{
              fontSize: 40,
              fontWeight: "bold",
              color: "#dbdbdb",
              marginBottom: 40,
              fontFamily: "Estedad"
            }}
          >
            {i18n.t("sign_in")}
          </Text>

          {/* Email */}
          <TextInput
            placeholder={i18n.t("enter_email")}
            placeholderTextColor="#646464"
            value={email}
            onChangeText={setEmail}
            style={{
              width: "90%",
              backgroundColor: "#484848",
              borderRadius: 10,
              padding: 20,
              color: "#ffffff",
              marginBottom: 15,
              shadowColor: "#000000",
              shadowOpacity: 0.3, 
              shadowRadius: 10, 
              elevation: 10,
            }}
          />

          {/* Password */}
          <View style={{ width: "90%", marginBottom: 15 }}>
            <TextInput
              placeholder={i18n.t("enter_password")}
              placeholderTextColor="#646464"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              style={{
                width: "100%",
                backgroundColor: "#484848",
                borderRadius: 10,
                padding: 20,
                paddingRight: 55,
                color: "#ffffff",
                shadowColor: "#000000",
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
              }}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: 20,
                top: 18,
                width: 30,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={passwordVisible ? "eye" : "eye-off"}
                size={24}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => navigation.navigate(SCREENS.RESET_PASSWORD)}
            style={{ width: "90%", alignItems: "flex-start", marginBottom: 50 }}>
            <Text style={{ color: "#056e49", fontSize: 14, fontFamily: "PlayfairDisplay" }}>
              {i18n.t("forgot_password")}
            </Text>
          </TouchableOpacity>

          {/* Button */}
          <TouchableOpacity 
            onPress={async () => {
             await playSound();
             await handleLogin();
            }}
            style={{
              width: "90%",
              backgroundColor: "#1b3f32",
              padding: 15,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 30,
              shadowColor: "#000000",
              shadowOpacity: 0.3, 
              shadowRadius: 10, 
              elevation: 10,
            }}
          >
            <Text style={{ color: "#dbdbdb", fontWeight:"bold", fontSize: 20, fontFamily: "Estedad" }}>
              {i18n.t("sign_in")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
          onPress={ () => navigation.replace(SCREENS.CREATE_ACCOUNT)}
          style={{ width: "90%", alignItems: "center",marginBottom: 50 }}>
            <Text style={{ color: "#056e49", fontSize: 15, fontFamily: "PlayfairDisplay" }}>
              {i18n.t("create_account")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
              onPress={ () => toggleLanguage()}
              style={{
              backgroundColor: "#484848",
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              width: 50,
              height: 50,
              shadowColor: "#000000",
              shadowOpacity: 0.3, 
              shadowRadius: 10, 
              elevation: 10,
              marginBottom: 30
            }}
          >
            <Ionicons name="language" size={30} color="#2c2c2c" />
          </TouchableOpacity>

        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}