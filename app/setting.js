import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { getMedicalData, saveMedicalData } from '../services/medicalService';
import { getCurrentUser, logout, removeUser, saveLanguage } from '../services/storage';
import { deleteUserData, getUserLanguage, saveUserLanguage } from "../services/userService";
import { SCREENS } from './constants';

export default function SettingScreen() {
  const navigation = useNavigation();


  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [visible3, setVisible3] = useState(false);

  const [lang, setLang] = useState(i18n.locale);

  const changeLanguage = async (newLang) => {
    i18n.locale = newLang;
    setLang(newLang);
    await saveLanguage(newLang);

    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        await saveUserLanguage(currentUser, newLang);
        console.log("Language saved to Firebase separately:", newLang);
      }
    } catch (e) {
      console.log("Error saving language to Firebase:", e);
    }
  };


  const [gender, setGender] = useState("male");
  const [diseases, setDiseases] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

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

  const removeAccount = async () => {
    try {
      const currentUser = await getCurrentUser();
      await deleteUserData(currentUser);
      await removeUser();
      await logout();
      navigation.replace(SCREENS.SIGN_IN);
    } catch (e) {
      console.log('removeAccount error', e);
      Alert.alert('خطأ', 'حدث خطأ أثناء حذف الحساب. حاول مرة أخرى.');
    }
  };

  
  
  const toggleDisease = (item) => {
    if (diseases.includes(item)) {
      setDiseases(diseases.filter(d => d !== item));
    } else {
      setDiseases([...diseases, item]);
    }
  };

  const toggleAllergy = (item) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter(a => a !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const loadMedicalData = async () => {
    try {
      const currentUser = await getCurrentUser();
      const medicalData = await getMedicalData(currentUser);
      if (medicalData && isMountedRef.current) {
        setName(medicalData.name || "");
        setAge(medicalData.age ? String(medicalData.age) : "");
        setGender(medicalData.gender || "male");
        setHeight(medicalData.height_cm ? String(medicalData.height_cm) : "");
        setWeight(medicalData.weight_kg ? String(medicalData.weight_kg) : "");
        setDiseases(medicalData.chronic_diseases || []);
        setAllergies(medicalData.allergies || []);
        setNotes(medicalData.other_user_notes || "");
      }

      try {
        const userLanguage = await getUserLanguage(currentUser);
        if (userLanguage && isMountedRef.current) {
          i18n.locale = userLanguage;
          setLang(userLanguage);
          await saveLanguage(userLanguage);
        }
      } catch (e) {
        console.log("Error loading user language from Firebase:", e);
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const saveUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      const medicalData = {
        name,
        age: Number(age),
        gender,
        height_cm: Number(height),
        weight_kg: Number(weight),
        chronic_diseases: diseases,
        allergies: allergies,
        other_user_notes: notes
      };
      await saveMedicalData(currentUser, medicalData);
    } catch (e) {
      console.log('saveUserData error', e);
      Alert.alert('خطأ', 'فشل حفظ البيانات. حاول مرة أخرى.');
    }
  };

  // تحميل البيانات عند فتح الشاشة
  useEffect(() => {
    loadMedicalData();
  }, []);

  const sendUserData = async () => {
    const userData = {
      name,
      age: Number(age),
      gender,
      height_cm: Number(height),
      weight_kg: Number(weight),
      chronic_diseases: diseases,
      allergies: allergies,
      other_user_notes: notes
    };

  };

  const [loaded] = useFonts({
      Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
      PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-VariableFont_wght.ttf'),
      Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
      });

  if (loading) {
    return (
      <SafeAreaView style={{flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#202020"}}>
        <Text style={{color:"#dbdbdb"}}>Loading...</Text>
      </SafeAreaView>
    );
  }

  
    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: "#202020" }}> 
        <View style={{ flex: 1, marginBottom: -20 }}>
          <View
            style={{
              flexDirection: "row",
              gap:20,
              alignItems: "center",
              backgroundColor:"#202020",
              paddingVertical: 5,
            }}
          >     
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginLeft: 10,
              padding: 8,
              backgroundColor: "#1b3f32",
              borderRadius: 50,
              justifyContent:"center",
              alignItems: "flex-start"
           }}
          >
            <Ionicons name="arrow-back" size={25} color="#dbdbdb"/>
          </TouchableOpacity>

          <Text style={{fontSize:30, fontWeight:"bold", color:"#dbdbdb", fontFamily:"Estedad"}}>{i18n.t("settings")}</Text>
          </View>

          <View style={{flex:1, justifyContent:"flex-start", gap:5, marginTop:20}}>

          <TouchableOpacity
            onPress={() => setVisible(true)}
            style={{
              
              width: "100%",
              
              padding: 20,
              borderRadius: 0,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              borderWidth: 1,
              borderColor:"#161616",
            }}
          >
            <Text style={{ color: "#999999", fontWeight:"400", fontSize: 25, fontFamily:"Estedad"}}>
              {i18n.t("language")}
            </Text>
          </TouchableOpacity>
          <Modal visible={visible} transparent={true} animationType="fade">
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.0)", // خلفية شفافة
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View 
                style={{
                  width: 300,
                  padding: 20,
                  backgroundColor: "#474747",
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{color:"#f0f0f0", fontSize:20, fontWeight:"bold", marginBottom:10 , fontFamily:"Estedad"}}>{i18n.t("language")}</Text>
                <Text style={{color:"#a3a3a3", fontSize:13, alignItems:"flex-start", marginBottom:10 , fontFamily:"PlayfairDisplay"}}>{i18n.t("Language warning")}</Text>
                <View style={{width:200, }}>
                  <TouchableOpacity
                  onPress={() => changeLanguage("en")}
                  style={{
                    padding: 10,
                    backgroundColor:"#585858",
                    borderRadius: 5,
                    justifyContent:"center",
                    alignItems:"center"
                  }}
                >
                  <Text style={{color:"#ffffff", fontSize:15 , fontWeight:"500"}}>{i18n.t("english")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => changeLanguage("fr")}
                  style={{
                    marginTop: 10,
                    padding: 10,
                    backgroundColor:"#585858",
                    borderRadius: 5,
                    justifyContent:"center",
                    alignItems:"center"
                  }}
                >
                  <Text style={{color:"#ffffff", fontSize:15 , fontWeight:"500"}}>{i18n.t("french")}</Text>
                </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => setVisible(false)}
                  style={{
                    marginTop: 20,
                    padding: 15,
                    backgroundColor: "#1b3f32",
                    borderRadius: 25,
                  }}
                >
                  <Text style={{ color: "white" }}>{i18n.t("save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          <TouchableOpacity
            onPress={() => setVisible2(true)}
            style={{
              width: "100%",
              padding: 20,
              borderRadius: 0,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              borderWidth: 1,
              borderColor:"#161616",
            }}
          >
            <Text style={{ color: "#999999", fontWeight:"400", fontSize: 25, fontFamily:"Estedad"}}>
              {i18n.t("medical_information")}
            </Text>
          </TouchableOpacity>
          <Modal visible={visible2} transparent={true} animationType="fade">
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
              <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.0)", // خلفية شفافة
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View 
                style={{
                  width: 330,
                  padding: 20,
                  backgroundColor: "#474747",
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{color:"#f0f0f0", fontSize:20, fontWeight:"bold", marginBottom:10 , fontFamily:"Estedad"}}>{i18n.t("medical_information")}</Text>
                <Text style={{color:"#a3a3a3", fontSize:13, fontWeight:"400", alignItems:"flex-start", marginBottom:10 , fontFamily:"PlayfairDisplay"}}>{i18n.t("medical_information_edit")}</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection:"row",
                    gap:10, 
                    justifyContent:"center", 
                    alignContent:"center",
                    marginTop:20, 
                    marginBottom:10
                  }}
                >
                  <TextInput
                    placeholder= {i18n.t("name")}
                    placeholderTextColor="#777777"
                    value={name}
                    onChangeText={setName}
                    style={{
                      flex: 1,
                      backgroundColor: "#555555",
                      borderRadius: 10,
                      padding: 15,
                      color: "#fff",
                      marginBottom: 15, 
                      shadowColor: "#000000", 
                      shadowOpacity: 0.3, 
                      shadowRadius: 10, 
                      elevation: 10,
                    }}
                  />
                  <TextInput
                    placeholder= {i18n.t("age")}
                    placeholderTextColor="#777777"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      backgroundColor: "#555555",
                      borderRadius: 10,
                      padding: 15,
                      color: "#fff",
                      marginBottom: 15, 
                      shadowColor: "#000000", 
                      shadowOpacity: 0.3, 
                      shadowRadius: 10, 
                      elevation: 10,
                    }}
                  />
                  <TouchableOpacity
                  onPress={() => setGender("male")}
                 style={{
                   flex: 1,
                   backgroundColor: gender === "male" ? "#1b3f32" : "#555555",
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
               onPress={() => setGender("female")}
               style={{
                 flex: 1,
                 backgroundColor: gender === "female" ? "#2a4938" : "#555555",
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
                     placeholderTextColor="#777777"
                     value={height}
                     onChangeText={setHeight}
                     keyboardType="numeric"
                     style={{
                       width: "50%",
                       backgroundColor: "#555555",
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
                       placeholderTextColor="#777777"
                       value={weight}
                       onChangeText={setWeight}
                       keyboardType="numeric"
                       style={{
                         width: "50%",
                         backgroundColor: "#555555",
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
                         <Text style={{ color: "#fff", marginTop: 20, fontFamily:"PlayfairDisplay", marginBottom:10 }}>
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
                               backgroundColor: diseases.includes(item) ? "#1b3f32" : "#555555"
                             }}
                           >
                             <Text style={{ color: "#fff" }}>{i18n.t(`diseasesList.${item}`)}</Text>
                           </TouchableOpacity>
                          ))}
                          </View>
                             <Text style={{ color: "#fff", marginTop: 20, fontFamily:"PlayfairDisplay", marginBottom:10 }}>
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
                                 backgroundColor: allergies.includes(item) ? "#1b3f32" : "#555555"
                                  }}
                                >
                                 <Text style={{ color: "#fff" }}>{i18n.t(`allergiesList.${item}`)}</Text>
                                </TouchableOpacity>
                               ))}
                               </View>
                               </View>
                      
                               <TextInput 
                                   placeholder= {i18n.t("other_user_notes")}
                                   placeholderTextColor="#777777"
                                   multiline={true}
                                   value={notes}
                                   onChangeText={setNotes}
                                   style={{
                                    width: "100%",
                                    backgroundColor: "#555555",
                                    borderRadius: 10,
                                    padding: 20,
                                    color: "#ffffff",
                                    marginBottom: 15,
                                    marginTop: 15
                                   }}
                                 />

                <TouchableOpacity
                  onPress={async () => {
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

                  if (Number(weight) < 15 || Number(weight) > 300) {
                   alert("Invalid weight");
                   return;
                  }
                  await saveUserData();
                  await loadMedicalData();
                  
                  setVisible2(false);
               }}
                  style={{
                    marginTop: 20,
                    padding: 15,
                    backgroundColor: "#1b3f32",
                    borderRadius: 25,
                  }}
                >
                  <Text style={{ color: "white" }}>{i18n.t("save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
            </ScrollView>
          </Modal>
          <TouchableOpacity
            onPress={() => setVisible3(true)}
            style={{
              width: "100%",
              padding: 20,
              borderRadius: 0,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              borderWidth: 1,
              borderColor:"#161616",
            }}
          >
            <Text style={{ color: "#949494", fontWeight:"400", fontSize: 25, fontFamily:"Estedad"}}>
              {i18n.t("privacy_policy")}
            </Text>
          </TouchableOpacity>
          <Modal visible={visible3} transparent={true} animationType="fade">
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
              <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.0)", // خلفية شفافة
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View 
                style={{
                  width: 300,
                  padding: 20,
                  backgroundColor: "#474747",
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{fontSize:20,  color:"#dbdbdb", marginBottom:20, fontFamily:"Estedad", fontWeight:"800"}}>{i18n.t("privacy_policy")}</Text>
                <Text style={{color:"#a3a3a3", fontSize:15, fontWeight:"400", alignItems:"flex-start", marginBottom:10, fontFamily:"PlayfairDisplay"}}>{i18n.t("privacy_policy_content")}</Text>
                <TouchableOpacity 
                 onPress={() => setVisible3(false)}
                 style={{
                    marginTop: 20,
                    padding: 15,
                    backgroundColor: "#1b3f32",
                    borderRadius: 25,
                  }}
                >
                  <Text style={{ color: "white", fontFamily:"Estedad" }}>{i18n.t("close")}</Text>
                </TouchableOpacity>
              </View>
              </View>
              </ScrollView>
          </Modal>

          <TouchableOpacity
            onPress={() => navigation.navigate(SCREENS.SIGN_IN)}
            style={{       
              width: "100%",           
              padding: 20,
              borderRadius: 0,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              borderWidth: 1,
              borderColor:"#161616",
            }}
          >
            <Text style={{ color: "#0d754f", fontWeight:"400", fontSize: 25, fontFamily:"Estedad"}}>
              {i18n.t("sign_out")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
            Linking.openURL("https://www.buymeacoffee.com/yourname");
            }}
            style={{
             width: "100%",
             padding: 20,
             borderWidth: 1,
             borderColor: "#161616",
             justifyContent: "center",
             alignItems: "center",
             marginBottom: 10,
             borderRadius: 0,
            }}
          >
           <Text style={{ color: "#f5c542", fontSize: 25, fontFamily: "Estedad" }}>
              {i18n.t("Support Developer")}
           </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeAccount()}
            style={{           
              width: "100%",          
              padding: 20,
              borderRadius: 0,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              borderWidth: 1,
              borderColor:"#161616",
            }}
          >
            <Text style={{ color: "#ad2c2c", fontWeight:"400", fontSize: 25, fontFamily:"Estedad"}}>
              {i18n.t("delete_account")}
            </Text>
          </TouchableOpacity>
          </View> 
        </View> 
        </SafeAreaView>   
    )
}