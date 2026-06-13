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
import { createAuthUser } from '../services/userService';
import { SCREENS } from './constants';


export default function CreateAccountScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    const normalizedConfirmPassword = confirmPassword.trim();

    if (!normalizedEmail || !normalizedPassword || !normalizedConfirmPassword) {
      Alert.alert(i18n.t("Fill_all_fields"));
      return false;
    }

    if (normalizedPassword !== normalizedConfirmPassword) {
      Alert.alert(i18n.t("password_mismatch"));
      return false;
    }

    if (normalizedPassword.length < 6) {
      Alert.alert(i18n.t("password_too_short"));
      return false;
    }

    try {
      await createAuthUser(normalizedEmail, normalizedPassword);
      Alert.alert(i18n.t("account_created"));
      navigation.replace(SCREENS.USER_INFO);
      return true;
    } catch (error) {
      console.log("AUTH SIGNUP ERROR", error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(i18n.t("have't_account"));
      } else {
        Alert.alert(i18n.t("failed_to_create_account"));
      }
      return false;
    }
  };

  const [loaded] = useFonts({
      Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
      PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-VariableFont_wght.ttf')
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
            Create account
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
              shadowColor: "#000000",
              shadowOpacity: 0.3, 
              shadowRadius: 10, 
              elevation: 10,
              marginBottom: 20
            }}
          />

          {/* Password */}
          <View
            style={{
              width: "90%",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#484848",
              borderRadius: 10,
              paddingHorizontal: 15,
              marginBottom: 20,
              shadowColor: "#000000",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <TextInput
              placeholder={i18n.t("enter_password")}
              placeholderTextColor="#646464"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={{
                flex: 1,
                paddingVertical: 20,
                color: "#ffffff",
              }}
            />
            <TouchableOpacity 
            onPress={ () => 
              setShowPassword(!showPassword)
            } style={{ padding: 8 }}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#9b9b9b" />
            </TouchableOpacity>
          </View>

          {password.length > 0 && password.length < 6 && (
            <Text style={{ color: "#ff6b6b", marginTop: 1, marginBottom: 12, width: "90%", textAlign: "left", fontFamily: "PlayfairDisplay" }}>
              {i18n.t("password_too_short")}
            </Text>
          )}

          <View
            style={{
              width: "90%",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#484848",
              borderRadius: 10,
              paddingHorizontal: 15,
              marginBottom: 50,
              shadowColor: "#000000",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <TextInput
              placeholder={i18n.t("confirm_password")}
              placeholderTextColor="#646464"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{
                flex: 1,
                paddingVertical: 20,
                color: "#ffffff",
              }}
            />
            <TouchableOpacity 
            onPress={ () =>
              setShowConfirmPassword(!showConfirmPassword)
            } style={{ padding: 8 }}>
              <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={22} color="#9b9b9b" />
            </TouchableOpacity>
          </View>


          {/* Button */}
          <TouchableOpacity
            onPress={async () => {
              const success = await handleSignup();
              if (success) {
                await playSound();
              }
            }}
            style={{
              width: "90%",
              backgroundColor: "#1b3f32",
              padding: 15,
              borderRadius: 23,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              shadowColor: "#000000",
              shadowOpacity: 0.3, 
              shadowRadius: 10, 
              elevation: 10,
            }}
          >
            <Text style={{ color: "#dbdbdb", fontWeight:"bold", fontSize: 20, fontFamily: "Estedad" }}>
              {i18n.t("next")}
            </Text>
          </TouchableOpacity>


        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}