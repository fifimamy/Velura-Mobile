import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { saveMedicalData } from "../services/medicalService";
import { getCurrentUser } from "../services/storage";
import { SCREENS } from './constants';


export default function UserInformation() {
  const navigation = useNavigation();
  const [gender, setGender] = useState("male");
  const [diseases, setDiseases] = useState([]);
  const [Allergies, setAllergies] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  // const [bloodType, setBloodType] = useState("");
  // const [smokingStatus, setSmokingStatus] = useState("");
  // const [alcoholConsumption, setAlcoholConsumption] = useState("");
  // const [visionPower, setVisionPower] = useState("");

  const handleSaveMedicalData = async () => {
    const currentUser = await getCurrentUser();

    const medicalData = {
      name,
      age: Number(age),
      gender,
      height_cm: Number(height),
      weight_kg: Number(weight),
      chronic_diseases: diseases,
      allergies: Allergies,
      other_user_notes: notes,
      // blood_type: bloodType,
      // smoking_status: smokingStatus,
      // alcohol_consumption: alcoholConsumption,
      // vision_power: visionPower
    };

    await saveMedicalData(currentUser, medicalData);
  };

  const diseasesList = [
    "diabetes",
    "hypertension",
    "asthma",
    "heart_disease",
    "chronic_kidney_disease",
    "copd",
    "arthritis",
    "depression",
    "anxiety_disorders",
    "cancer"
  ];
  const toggleDisease = (item) => {
  if (diseases.includes(item)) {
    setDiseases(diseases.filter(d => d !== item));
  } else {
    setDiseases([...diseases, item]);
  }
 };
 const allergiesList = [
    "peanuts",
    "shellfish","pollen",
    "dust_mites",
    "animal_dander",
    "insect_stings",
    "latex",
    "certain_medications",
    "food_allergies"
  ];
  
 const toggleAllergy = (item) => {
  if (Allergies.includes(item)) {
    setAllergies(Allergies.filter(a => a !== item));
  } else {
    setAllergies([...Allergies, item]);
  }
 };



  const styles = {
   input: {
     flex: 1,
     backgroundColor: "#484848",
     borderRadius: 10,
     padding: 15,
     color: "#fff",
     marginBottom: 15, 
     shadowColor: "#000000", 
     shadowOpacity: 0.3, 
     shadowRadius: 10, 
     elevation: 10,
   },

   pickerContainer: {
     flex: 1,
     backgroundColor: "#484848",
     borderRadius: 10,
     justifyContent: "center",
   }
 };

 const sendUserData = async () => {
  const userData = {
    name,
    age: Number(age),
    gender,
    height_cm: Number(height),
    weight_kg: Number(weight),
    chronic_diseases: diseases,
    allergies: Allergies,
    other_user_notes: notes,
    // blood_type: bloodType,
    // smoking_status: smokingStatus,
    // alcohol_consumption: alcoholConsumption,
    // vision_power: visionPower
  };
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
  const playSound2 = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/click3.mp3'),
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

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
    

          <View style={{ flex: 1, padding: 20, justifyContent:"center", alignContent:"center"}}>
            <Text style={{ color: "#dbdbdb", fontWeight:"bold", fontSize:28, fontFamily: "Estedad" }}>{i18n.t("your_medical_information")}</Text>
            <View style={{ flexDirection: "row", gap:15 , justifyContent:"center", alignContent:"center",marginTop:20 }}>
             <TextInput 
               placeholder= {i18n.t("name")}
               placeholderTextColor="#646464"
               value={name}
               onChangeText={setName}
               style={styles.input}
               />
             <TextInput 
                placeholder= {i18n.t("age")}
                placeholderTextColor="#646464"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                style={styles.input} 
                />
              <TouchableOpacity
                 onPress={() => {setGender("male"), playSound2()}}
                 style={{
                   flex: 1,
                   backgroundColor: gender === "male" ? "#2a4938" : "#484848",
                   padding: 15,
                   borderRadius: 10,
                   alignItems: "center",
                   marginBottom: 15, 
                   shadowColor: "#000000", 
                   shadowOpacity: 0.3, 
                   shadowRadius: 10, 
                   elevation: 10,
                  }}
              >
                 <Ionicons name="male" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
               onPress={() => {setGender("female"), playSound2()}}
               style={{
                 flex: 1,
                 backgroundColor: gender === "female" ? "#2a4938" : "#484848",
                 padding: 15,
                 borderRadius: 10,
                 alignItems: "center",
                 marginBottom: 15, 
                 shadowColor: "#000000", 
                 shadowOpacity: 0.3, 
                 shadowRadius: 10, 
                 elevation: 10,
               }}
              >
               <Ionicons name="female" size={20} color="#fff" />
             </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 2, justifyContent:"center", alignContent:"center" }}>
             <TextInput 
               placeholder= {i18n.t("height")}
               placeholderTextColor="#646464"
               value={height}
               onChangeText={setHeight}
               keyboardType="numeric"
               style={{
                 width: "50%",
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
             <TextInput 
               placeholder= {i18n.t("weight")}
               placeholderTextColor="#646464"
               value={weight}
               onChangeText={setWeight}
               keyboardType="numeric"
               style={{
                 width: "50%",
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
            </View>
            <View style={{ marginTop: -10, justifyContent:"center", alignContent:"center" }}>
              <Text style={{ color: "#dbdbdb", marginTop: 20, fontFamily: "PlayfairDisplay", fontSize: 16, marginBottom: 10 }}>
                 {i18n.t("chronic_diseases")}
              </Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
               {diseasesList.map(item => (
                 <TouchableOpacity
                  key={item}
                  onPress={() => toggleDisease(item)}
                  style={{
                   padding: 10,
                   borderRadius: 20,
                   backgroundColor: diseases.includes(item) ? "#2a4938" : "#484848"
                  }}
                 >
                   <Text style={{ color: "#dbdbdb" }}>{i18n.t(`diseasesList.${item}`)}</Text>
                 </TouchableOpacity>
               ))}
             </View>
             <Text style={{ color: "#dbdbdb", marginTop: 20, fontFamily: "PlayfairDisplay", fontSize: 16, marginBottom: 10 }}>
                 {i18n.t("allergies")}
              </Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
               {allergiesList.map(item => (
                 <TouchableOpacity
                  key={item}
                  onPress={() => toggleAllergy(item)}
                  style={{
                   padding: 10,
                   borderRadius: 20,
                   backgroundColor: Allergies.includes(item) ? "#2a4938" : "#484848"
                  }}
                 >
                   <Text style={{ color: "#dbdbdb" }}>{i18n.t(`allergiesList.${item}`)}</Text>
                 </TouchableOpacity>
               ))}
             </View>
           </View>

           <TextInput 
             placeholder= {i18n.t("other_user_notes")}
             placeholderTextColor="#646464"
             multiline={true}
             value={notes}
             onChangeText={setNotes}
             style={{
              width: "100%",
              backgroundColor: "#484848",
              borderRadius: 10,
              padding: 20,
              color: "#ffffff",
              marginBottom: 15,
              marginTop: 15
             }}
           />
              <TouchableOpacity 
                onPress={async () => {
                  await playSound();
                  if (!name) {
                   alert("Enter your name");
                   return;
                  }

                  if (Number(age) < 7 || Number(age) > 120) {
                   alert("Invalid age");
                   return;
                  }

                  if (Number(height) < 50 || Number(height) > 250) {
                   alert("Invalid height");
                   return;
                  }

                  if (Number(weight) < 15|| Number(weight) > 300) {
                   alert("Invalid weight");
                   return;
                  }
                  await handleSaveMedicalData();
                  await navigation.replace(SCREENS.CHAT);
                  
               }}

               style={{
                  width: "100%",
                  backgroundColor: "#2a4938",
                  padding: 15,
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                  shadowColor: "#000000",
                  shadowOpacity: 0.3, 
                  shadowRadius: 10, 
                  elevation: 10,
                  marginTop:15
                }}
              >
                <Text style={{ color: "#dbdbdb", fontWeight:"bold", fontSize: 20, fontFamily: "Estedad" }}>
                  {i18n.t("next")}
                </Text>
              </TouchableOpacity>
          </View>
          </ScrollView>
         </KeyboardAvoidingView>
       </ImageBackground>
    </SafeAreaView>
  );
}