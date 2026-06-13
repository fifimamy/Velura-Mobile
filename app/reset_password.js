import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
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
import { confirmPasswordResetCode, sendPasswordReset } from '../services/userService';
import { SCREENS } from './constants';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const isMountedRef = useRef(true);

  const [loaded] = useFonts({
    Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
    PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-VariableFont_wght.ttf')
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert(i18n.t("enter_email"));
      return;
    }

    try {
      await sendPasswordReset(email);
      if (isMountedRef.current) {
        setEmailSent(true);
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.log("RESET EMAIL ERROR", error);
      if (error.code === 'auth/user-not-found') {
        Alert.alert(i18n.t("have't_account"));
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert(i18n.t("enter_email"));
      } else {
        Alert.alert(i18n.t("failed_to_send_reset_email"));
      }
    }
  };

  const handleConfirmReset = async () => {
    if (!resetCode) {
      Alert.alert('رمز مفقود', 'من فضلك أدخل رمز إعادة التعيين.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('بيانات ناقصة', 'من فضلك أدخل كلمة المرور الجديدة وتأكيدها.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('خطأ', 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل.');
      return;
    }

    setResetLoading(true);
    try {
      await confirmPasswordResetCode(resetCode, newPassword);
      if (isMountedRef.current) {
        Alert.alert('نجاح', 'تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.');
        navigation.replace(SCREENS.SIGN_IN);
      }
    } catch (error) {
      console.log('RESET CONFIRM ERROR', error);
      if (error.code === 'auth/expired-action-code') {
        Alert.alert('انتهت الصلاحية', 'انتهت صلاحية رمز إعادة التعيين. اطلب رابطًا جديدًا.');
      } else if (error.code === 'auth/invalid-action-code') {
        Alert.alert('رمز غير صالح', 'رمز إعادة التعيين غير صالح. تأكد من نسخه بشكل صحيح.');
      } else {
        Alert.alert('فشل', 'فشل إعادة تعيين كلمة المرور. حاول مرة أخرى.');
      }
    } finally {
      if (isMountedRef.current) {
        setResetLoading(false);
      }
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
          <Text
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "#dbdbdb",
              marginBottom: 30,
              fontFamily: "Estedad"
            }}
          >
            {i18n.t("reset_password")}
          </Text>

          <View style={{ width: "90%", marginBottom: 15 }}>
            <TextInput
              placeholder={i18n.t("enter_email")}
              placeholderTextColor="#646464"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                width: "100%",
                backgroundColor: "#484848",
                borderRadius: 10,
                padding: 20,
                color: "#ffffff",
                shadowColor: "#000000",
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSendResetEmail}
            style={{
              width: "90%",
              backgroundColor: "#1b3f32",
              padding: 15,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              shadowColor: "#000000",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Text style={{ color: "#dbdbdb", fontWeight: "bold", fontSize: 18, fontFamily: "Estedad" }}>
              {i18n.t("send_reset_email")}
            </Text>
          </TouchableOpacity>

          {emailSent && (
            <Text style={{ color: "#b4f9b4", marginTop: 15, width: "90%", textAlign: "center", fontFamily: "PlayfairDisplay" }}>
              تم إرسال رسالة إعادة التعيين إلى بريدك الإلكتروني. تحقق من صندوق الوارد أو الرسائل المزعجة.
            </Text>
          )}

          {emailSent && (
            <View style={{ width: "90%", marginTop: 20 }}>
              <TextInput
                placeholder="رمز إعادة التعيين"
                placeholderTextColor="#646464"
                value={resetCode}
                onChangeText={setResetCode}
                autoCapitalize="none"
                style={{
                  width: "100%",
                  backgroundColor: "#484848",
                  borderRadius: 10,
                  padding: 20,
                  color: "#ffffff",
                  shadowColor: "#000000",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 10,
                  marginBottom: 15,
                }}
              />
              <TextInput
                placeholder="كلمة المرور الجديدة"
                placeholderTextColor="#646464"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={{
                  width: "100%",
                  backgroundColor: "#484848",
                  borderRadius: 10,
                  padding: 20,
                  color: "#ffffff",
                  shadowColor: "#000000",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 10,
                  marginBottom: 15,
                }}
              />
              <TextInput
                placeholder="تأكيد كلمة المرور الجديدة"
                placeholderTextColor="#646464"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={{
                  width: "100%",
                  backgroundColor: "#484848",
                  borderRadius: 10,
                  padding: 20,
                  color: "#ffffff",
                  shadowColor: "#000000",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 10,
                }}
              />
            </View>
          )}

          {emailSent && (
            <TouchableOpacity
              onPress={handleConfirmReset}
              disabled={resetLoading}
              style={{
                width: "90%",
                backgroundColor: resetLoading ? "#3b6f4f" : "#2b8a3e",
                padding: 15,
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                shadowColor: "#000000",
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
              }}
            >
              <Text style={{ color: "#dbdbdb", fontWeight: "bold", fontSize: 18, fontFamily: "Estedad" }}>
                {resetLoading ? "جاري التأكيد..." : "تأكيد إعادة التعيين"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => navigation.replace(SCREENS.SIGN_IN)}
            style={{ width: "90%", alignItems: "center", marginTop: 20 }}
          >
            <Text style={{ color: "#949494", fontSize: 14, fontFamily: "PlayfairDisplay" }}>
              {i18n.t("back_to_sign_in")}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
