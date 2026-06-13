import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Image, ImageBackground, Text, View } from 'react-native';
import { SCREENS } from './constants';


export default function SplashScreen() {
  
  const navigation = useNavigation();

  const playSound = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('../assets/sounds/splash.mp3')
  );

  await sound.playAsync();
};

  useEffect(() => {

    console.log("Splash mounted");
    playSound();
   const timer = setTimeout(() => {
    console.log("Trying navigation...");
    if (navigation?.replace) {
      navigation.replace(SCREENS.SIGN_IN);
    }
  }, 5000);

  return () => clearTimeout(timer);
  }, [navigation]);

  const [loaded] = useFonts({
  Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
  PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-VariableFont_wght.ttf'),
  Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
  });

 return (
    
    <ImageBackground
      source={require('../assets/images/background1.png')} // ضع هنا مسار صورتك
      style={{ flex: 1 }} // لتغطية كل الشاشة
      resizeMode="cover" // لتوسيع الصورة لتملأ المساحة
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../assets/images/logo.png')} 
         style={{
            width:200,
            height:200,
            justifyContent : "center",
            alignContent: "center"
        }}
             />
        <Text 
         style ={{
            fontSize:28,
            fontWeight: "bold", 
            color: "#dbdbdb",
            lineHeight : 30,
            justifyContent :"center",
            alignContent :"center",
            fontFamily: "Estedad"
         }}
        >VELURA MEDICAL</Text>
        
        <Text
         style ={{
            fontSize:20,
            fontWeight: "100", 
            color: "#c0c0c0",
            lineHeight : 25,
            justifyContent :"center",
            alignContent :"center",
            fontFamily: "PlayfairDisplay"
         }}
        >Inteleigent medical assistant</Text>

        <Text
         style ={{
            fontWeight: "100", 
            color: "#688f82",
            lineHeight : 20,
            position: 'absolute',
            bottom: -70,
            right: -150,
            width: 500,
            height: 100,
            justifyContent :"center",
            alignContent :"center",
            fontFamily: "PlayfairDisplay"
         }}
        >Powered by AI. Information may not always be accurate</Text>
      </View>
    </ImageBackground>
)
}