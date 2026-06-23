import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import {
  deleteChat,
  getChats as getChatsFromFirebase,
  saveChat
} from "../services/chatService";
// import API from '../services/api';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useFonts } from 'expo-font';
import {
  getChats as getLocalChats,
  saveChats
} from "../services/chatStorage";
import { auth } from '../services/firebase';
import { getCurrentUser } from '../services/storage';
import { SCREENS } from './constants';




export default function ChatScreen() {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState(false);
  const abortRef = useRef(null);
  const isMountedRef = useRef(true);
  const [doctor, setDoctor] = useState(false);
  const [fileMenu, setFileMenu] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [doctorType1, setDoctorType1] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [longPressMenu, setLongPressMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageOptions, setMessageOptions] = useState(false);
  const [renameChatModal, setRenameChatModal] = useState(false);
  const [renameChatTitle, setRenameChatTitle] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [pendingPreviousAiReply, setPendingPreviousAiReply] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null);

  const generateUniqueId = () => `${Date.now().toString()}_${Math.random().toString(36).slice(2, 8)}`;

  const getSecureChatApiUrl = () => {
    const url = "https://velura-medical.onrender.com/chat";
    if (!url.startsWith("https://")) {
      throw new Error("Insecure API URL: only HTTPS is allowed");
    }
    return url;
  };


  useEffect(() => {
  const setupAudio = async () => {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
      allowsRecordingIOS: false,
    });
  };

  setupAudio();
}, []);

  const saveChatToFirestore = async (chat) => {
  try {
    await saveChat(currentUser, chat);

    console.log("Chat saved to Firestore:", chat);
  } catch (e) {
    console.log("Error saving chat:", e);
  }
 };


  const toggleDoctorType = (type) => {
  setDoctorType1(type);
 };
  useEffect(() => {
  if (!currentChatId && chats.length > 0) {
    setCurrentChatId(chats[0].id);
  }
  }, [chats]);


  const openChat = (chat) => {
  setCurrentChatId(chat.id);
  setMessages(chat.messages);
  setMenu(false);
  };

  useEffect(() => {
  const active = chats?.find(c => c.id === currentChatId);
  if (active) {
    setMessages(active.messages);
  }
}, [chats, currentChatId]);
  

  useEffect(() => {
  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  loadUser();
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUser) return;

      const remoteChats = await getChatsFromFirebase(currentUser);
      if (remoteChats && remoteChats.length > 0) {
        if (isMountedRef.current) {
          setChats(remoteChats);
          setCurrentChatId(remoteChats[0].id);
          setMessages(remoteChats[0].messages || []);
        }
        await saveChats(remoteChats);
        return;
      }

      const localChats = await getLocalChats();
      if (localChats && localChats.length > 0 && isMountedRef.current) {
        setChats(localChats);
        setCurrentChatId(localChats[0].id);
        setMessages(localChats[0].messages || []);
      }
    };

    loadChats();
  }, [currentUser]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch {}
      }
    };
  }, []);
  
  const createNewChat = async () => {
    const newChat = {
      id: generateUniqueId(),
      title: "محادثة جديدة",
      doctorType: doctorType1,
      messages: []
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setMessages([]);

    try {
      await saveChats(updatedChats);
      await saveChat(currentUser, newChat);
    } catch (e) {
      console.log('createNewChat persistence error', e);
    }
  };
 
  const deleteChatHandler = async (chatId) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);
    try {
      await saveChats(updatedChats);
      await deleteChat(currentUser, chatId);
    } catch (e) {
      console.log('deleteChatHandler error', e);
    }
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
      setMessages(updatedChats.length > 0 ? updatedChats[0].messages : []);
    }
    setLongPressMenu(false);
  };

  const pinChatHandler = async (chatId) => {
    const updatedChats = chats.map(c => 
      c.id === chatId ? { ...c, pinned: !c.pinned } : c
    ).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    setChats(updatedChats);
    setLongPressMenu(false);

    try {
      await saveChats(updatedChats);
      const updatedChat = updatedChats.find(c => c.id === chatId);
      if (updatedChat) {
        await saveChat(currentUser, updatedChat);
      }
    } catch (e) {
      console.log('pinChatHandler persistence error', e);
    }
  };

  const confirmDeleteChat = (chatId) => {
    if (!chatId) return;

    Alert.alert(
      i18n.t("delete_chat"),
      i18n.t("delete_chat_confirmation"),
      [
        {
          text: i18n.t("no"),
          style: "cancel",
        },
        {
          text: i18n.t("yes"),
          style: "destructive",
          onPress: () => deleteChatHandler(chatId),
        },
      ],
      { cancelable: true }
    );
  };

  const openRenameChatModal = () => {
    if (!selectedChat) return;
    setRenameChatTitle(selectedChat.title || "");
    setLongPressMenu(false);
    setRenameChatModal(true);
  };

  const saveChatName = async () => {
    if (!selectedChat) return;

    const updatedChats = chats.map(chat =>
      chat.id === selectedChat.id ? { ...chat, title: renameChatTitle } : chat
    );

    setChats(updatedChats);
    try {
      await saveChats(updatedChats);
      const activeChat = updatedChats.find(c => c.id === currentChatId);
      if (activeChat) {
        await saveChat(currentUser, activeChat);
      }
    } catch (e) {
      console.log('saveChatName persistence error', e);
    }

    setRenameChatModal(false);
  };

  const normalizeMessageText = (text) => {
    if (typeof text === "object") {
      return text.reply || JSON.stringify(text);
    }
    return text || "";
  };

  const copyMessage = async (text) => {
    await Clipboard.setString(normalizeMessageText(text));
    setMessageOptions(false);
  };

  const copyText = async (text) => {
    await Clipboard.setString(normalizeMessageText(text));
  };

  const setAiFeedback = async (messageId, feedback) => {
    const updatedChats = chats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    }));

    setChats(updatedChats);
    const activeChat = updatedChats.find(c => c.id === currentChatId);
    if (activeChat) {
      setMessages(activeChat.messages);
      try {
        await saveChats(updatedChats);
        await saveChat(currentUser, activeChat);
      } catch (e) {
        console.log('setAiFeedback persistence error', e);
      }
    }
  };

  const transferOldAiReply = async (messageId) => {
    const updatedChats = chats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg =>
        msg.id === messageId && msg.previousText
          ? { ...msg, showingPrevious: true }
          : msg
      )
    }));

    setChats(updatedChats);
    const activeChat = updatedChats.find(c => c.id === currentChatId);
    if (activeChat) {
      setMessages(activeChat.messages);
      try {
        await saveChats(updatedChats);
        await saveChat(currentUser, activeChat);
      } catch (e) {
        console.log('transferOldAiReply persistence error', e);
      }
    }
  };

    const switchAiVersion = async (messageId) => {
  const updatedChats = chats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg => {
        if (msg.id !== messageId) return msg;

        const previousVersions = msg.previousVersions || [];
        const nextVersion = (Number(msg.currentVersion) + 1) % (previousVersions.length + 1);

        return {
          ...msg,
          currentVersion: nextVersion,
        };
      })
    }));

    setChats(updatedChats);
  const activeChat = updatedChats.find(
    c => c.id === currentChatId
  );

  if (activeChat) {
    setMessages(activeChat.messages);

    try {
      await saveChats(updatedChats);
      await saveChat(currentUser, activeChat);
    } catch (e) {
      console.log('switchAiVersion persistence error', e);
    }
  }
};

  const editMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingText(normalizeMessageText(message.text));
    setMessageOptions(false);
  };

  const saveEditedMessage = async () => {
    const activeChat = chats.find(chat => chat.id === currentChatId);
    if (!activeChat) return;

    const oldIndex = activeChat.messages.findIndex(msg => msg.id === editingMessageId);
    if (oldIndex === -1) return;

    const oldAi = oldIndex > 0 ? activeChat.messages[oldIndex - 1] : null;
    const previousAiText = oldAi?.sender === "ai"
      ? (typeof oldAi.text === "object" ? oldAi.text.reply || JSON.stringify(oldAi.text) : oldAi.text)
      : null;

    const shouldRemoveOldAi = oldAi?.sender === "ai";
    const updatedMessages = [...activeChat.messages];

    const newText = editingText.trim();

    updatedMessages[oldIndex] = {
     ...updatedMessages[oldIndex],
     text: newText
    };

    const updatedChats = chats.map(chat =>
     chat.id === currentChatId
     ? { ...chat, messages: updatedMessages }
     : chat
    );

    setChats(updatedChats);
    setMessages(updatedMessages);
    console.log("after delete", updatedMessages.length);

    await saveChats(updatedChats);
    const replaceInsertIndex = oldIndex;

    setPendingPreviousAiReply(previousAiText || null);
    setEditingMessageId(null);
    setEditingText("");

    if (newText) {
      await sendMessage(newText, previousAiText || null, replaceInsertIndex);
    }

    console.log("oldIndex", oldIndex);
    console.log("replaceInsertIndex", replaceInsertIndex);
    console.log("previousAiText", previousAiText);
  };

  const deleteMessage = async (messageId) => {
    const updatedChats = chats.map(chat => ({
      ...chat,
      messages: chat.messages.filter(msg => msg.id !== messageId)
    }));
    setChats(updatedChats);
    await saveChats(updatedChats);
    const activeChat = updatedChats.find(c => c.id === currentChatId);
    if (activeChat) {
      await saveChat(currentUser, activeChat);
      setMessages(activeChat.messages);
    }
    setChatToDelete(null);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };
  
  const doctorTypes = [
  {
    id: "general",
    image: require("../assets/images/general.png"),
  },

  {
    id: "neurologist",
    image: require("../assets/images/neurologist.png"),
  },

  {
    id: "psychiatrist",
    image: require("../assets/images/psychiatrist.png"),
  },

  {
    id: "gastroenterologist",
    image: require("../assets/images/gastroenterologist.png"),
  },

  {
    id: "cardiologist",
    image: require("../assets/images/cardiologist.png"),
  },

  {
    id: "pediatrician",
    image: require("../assets/images/pediatrician.png"),
  },

  {
    id: "dermatologist",
    image: require("../assets/images/dermatologist.png"),
  },
];
const getDoctorImage = (type) => {
  const doctor = doctorTypes.find(d => d.id === type);
  return doctor ? doctor.image : null;
};
  // 📷 فتح الكاميرا
const openCamera = async () => {
  // 1. طلب الإذن
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {

    return;
  }

  // 2. فتح الكاميرا
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  // 3. إضافة الصورة (وليس تعويضها)
  if (!result.canceled) {
    const newImage = result.assets[0].uri;

    setSelectedImages((prev) => [...prev, newImage]);
  }
};

 // 🖼️ فتح المعرض
const openGallery = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (!result.canceled) {
    const newImage = result.assets[0].uri;
     setSelectedImages((prev) => [...prev, newImage]);
  }
 };
  const sendMessage = async (textOverride = null, previousAiReply = null, replaceInsertIndex = null) => {
     console.log("SEND MESSAGE STARTED");
     console.log("currentUser =", currentUser);
     console.log("message =", message);
     console.log("selectedImages =", selectedImages);
     
    if (!currentUser) {
     Alert.alert("Error", "there is no logged in user");
     return;
    }

    const messageText = (textOverride ?? message).trim();
    if (!messageText && selectedImages.length === 0) return;

    const existingChat =
    chats.find(c => c.id === currentChatId);

    const newMessage =
  replaceInsertIndex !== null
    ? {
        ...existingChat.messages[replaceInsertIndex],
        text: messageText
      }
    : {
        id: generateUniqueId(),
        text: messageText,
        images: selectedImages,
        sender: "user",
        createdAt: new Date().toISOString()
      };

    let updatedChats = [...chats];
    let activeChat = null;

    const index = updatedChats.findIndex(c => c.id === currentChatId);

    if (index === -1) {
      activeChat = {
        id: generateUniqueId(),
        title: "محادثة جديدة",
        doctorType: doctorType1,
        messages: [newMessage],
        createdAt: new Date().toISOString()
      };

      updatedChats.unshift(activeChat);
      setCurrentChatId(activeChat.id);
    } else {
      if (replaceInsertIndex !== null) {
        const currentMessages = [...updatedChats[index].messages];
        currentMessages[replaceInsertIndex] = {
        ...currentMessages[replaceInsertIndex],
        text: messageText
        };
        updatedChats[index] = {
          ...updatedChats[index],
          messages: currentMessages,
          updatedAt: new Date().toISOString()
        };
      } else {
        updatedChats[index].messages.unshift(newMessage);
        updatedChats[index].updatedAt = new Date().toISOString();
      }
      activeChat = updatedChats[index];
    }

    setChats(updatedChats);
    setMessages(activeChat.messages);

    setMessage("");
    setSelectedImages([]);

    await saveChats(updatedChats);
    await saveChat(currentUser, activeChat);

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const formData = new FormData();

    const timestamp = Math.floor(Date.now() / 1000).toString();
    let idToken = null;
    try {
      const user = auth.currentUser || currentUser;
      if (user && user.getIdToken) {
        idToken = await user.getIdToken();
      }
    } catch (e) {
      console.warn('Failed to get ID token', e);
    }

    const sanitizeMessage = (text) => {
      if (!text) return '';
      let t = String(text).trim();
      if (t.length > 2000) t = t.slice(0, 2000);
      const forbidden = ['ignore instructions', 'system prompt', 'instruction:', '<script', '\\0'];
      forbidden.forEach((s) => {
        t = t.replace(new RegExp(s, 'gi'), '');
      });
      return t;
    };

    const messageText = sanitizeMessage(newMessage?.text || '');
    if (!messageText) {
      Alert.alert(i18n.t('error'), i18n.t('empty_message'));
      return;
    }

    formData.append('message', messageText);

    formData.append('doctor_type', doctorType1 || 'general');

    // user_id kept as fallback only; server MUST validate token
    formData.append('user_id', currentUser?.uid || currentUser);

    formData.append('chat_history', JSON.stringify(activeChat.messages.slice(-6)));

    if (selectedImages.length > 0) {
      const uri = selectedImages[0];
      try {
        const info = await FileSystem.getInfoAsync(uri, { size: true });
        const maxSize = 3 * 1024 * 1024; // 3MB
        const allowedExt = ['.jpg', '.jpeg', '.png'];
        const lower = uri.toLowerCase();
        const okExt = allowedExt.some((ext) => lower.endsWith(ext));
        if (!okExt) {
          Alert.alert(i18n.t('error'), i18n.t('image_type_not_allowed') || 'نوع الصورة غير مدعوم');
          return;
        }
        if (info.size && info.size > maxSize) {
          Alert.alert(i18n.t('error'), i18n.t('image_too_large') || 'الصورة أكبر من الحجم المسموح (3MB)');
          return;
        }
      } catch (e) {
        console.warn('FileSystem info error', e);
      }

      formData.append('image', {
        uri: uri,
        name: 'image.jpg',
        type: 'image/jpeg',
      });
    }

    const headers = {
      'X-Request-Timestamp': timestamp,
      'X-App-Version': '1.1.0',
    };
    if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
    console.log("URL =", getSecureChatApiUrl());
    console.log("FORMDATA READY");
    console.log("CHAT =", activeChat?.id);

    const response = await fetch(getSecureChatApiUrl(), {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers,
    });
    
    if (!response.ok) {
  const errorText = await response.text();
  console.log("SERVER RAW ERROR:", errorText);
  throw new Error(errorText);
}
    console.log("RESPONSE STATUS =", response.status);

    const data = await response.json();

    console.log("SERVER DATA =", JSON.stringify(data, null, 2));

    const serverTitle = data.response?.title || data.title || null;
    const shouldUpdateTitle = index === -1;

    const aiMessage = {
      id: `${generateUniqueId()}_ai`,
      text: data.response.reply,
      previousVersions: previousAiReply ? [previousAiReply] : [],
      currentVersion: 0,
      previousText: previousAiReply,
      sender: "ai",
      createdAt: new Date().toISOString(),
      classification: data.response.classification,
      evaluation: data.response.evaluation,
    };

    if (shouldUpdateTitle && serverTitle && activeChat) {
      updatedChats = updatedChats.map(chat =>
        chat.id === activeChat.id ? { ...chat, title: serverTitle } : chat
      );
      activeChat = { ...activeChat, title: serverTitle };
    }

    if (replaceInsertIndex !== null) {
      updatedChats = updatedChats.map(chat => {
        if (chat.id !== activeChat.id) return chat;

        const messagesCopy = [...chat.messages];
        const oldAiIndex = replaceInsertIndex - 1;
        const oldAi = messagesCopy[oldAiIndex];

        if (!oldAi) {
          console.log("oldAi is undefined");
          return chat;
        }

        messagesCopy[oldAiIndex] = {
          ...oldAi,
          previousVersions: [oldAi.text, ...(oldAi.previousVersions || [])],
          text: aiMessage.text,
          currentVersion: 0
        };

        return { ...chat, messages: messagesCopy };
      });
    } else {
      updatedChats = updatedChats.map(chat =>
        chat.id === activeChat.id
          ? { ...chat, messages: [aiMessage, ...chat.messages] }
          : chat
      );
    }
    console.log("AI MESSAGE OBJECT =", aiMessage);

    setChats(updatedChats);

    const updatedActiveChat = updatedChats.find(
      c => c.id === activeChat.id
    );

    if (isMountedRef.current) {
      setMessages(updatedActiveChat?.messages || []);
      setPendingPreviousAiReply(null);
      playSound3();
    }

    await saveChats(updatedChats);
    await saveChat(currentUser, updatedActiveChat);

  } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("ERROR NAME:", error?.name);
      console.log("ERROR MESSAGE:", error?.message);

    if (error.name !== 'AbortError' && isMountedRef.current) {
      Alert.alert("Error", "Unable to connect to the server");
    }

    console.log(error);
  } finally {
    clearTimeout(timeout);
    abortRef.current = null;
    if (isMountedRef.current) {
      setLoading(false);
    }
  }

  console.log("replaceInsertIndex", replaceInsertIndex);
  console.log("message before update", activeChat.messages);

 };

  // const DoctorContext = {
  //  type: "general",
  //  setType: () => {}
  // };
  const aiMessages = messages.filter((msg) => msg.sender === "ai");
  const latestAiMessageId = aiMessages[0]?.id;

    const renderItem = ({ item }) => {
    const isUser = item.sender === "user";
    const isEditing = item.id === editingMessageId;
    const aiIndex = item.sender === "ai" ? aiMessages.findIndex((ai) => ai.id === item.id) + 1 : null;
    const isSelected = selectedMessage?.id === item.id;
    let messageText = normalizeMessageText(item.text);

     if (
  item.sender === "ai" &&
  item.previousVersions &&
  item.previousVersions.length > 0
) {

  const allVersions = [
   item.text,
   ...(item.previousVersions || [])
  ];
  console.log(
   "SHOWING",
   item.currentVersion,
   allVersions
  );

  messageText =
   allVersions[item.currentVersion] ||
   allVersions[0];

   }

    return (
      <View>
        <TouchableOpacity
          onLongPress={() => {
            if (selectedMessage?.id === item.id) {
              setSelectedMessage(null);
            } else {
              setSelectedMessage(item);
            }
          }}
          activeOpacity={0.9}
        >
          <View
            style={{
              alignSelf: isUser ? "flex-end" : "flex-start",
              backgroundColor: isUser ? "#1b3f32" : "#202020",
              padding: 10,
              margin: 5,
              borderRadius: 10,
              maxWidth: "100%"
            }}
          >
            <View>
              {item.images && item.images.length > 0 && (
                <View>
                  {item.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      style={{ width: 150, height: 150, borderRadius: 10, marginBottom: 5 }}
                    />
                  ))}
                </View>
              )}

              {isEditing ? (
                <View>
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    style={{ color: "#fff", borderBottomWidth: 1, borderBottomColor: "#fff" }}
                    autoFocus
                  />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, width: "100%" }}>
                    <TouchableOpacity
                      onPress={saveEditedMessage}
                      style={{ flex: 1, padding: 10, backgroundColor: "#1b3f32", borderRadius: 8, alignItems: "center", marginRight: 5 }}
                    >
                      <Ionicons name="checkmark" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={cancelEdit}
                      style={{ flex: 1, padding: 10, backgroundColor: "#555", borderRadius: 8, alignItems: "center", marginLeft: 5 }}
                    >
                      <Ionicons name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={{ color: "#fff" }}>{messageText}</Text>
                  {item.sender === "ai" && item.previousVersions && item.previousVersions.length > 0 && (
                    <View style={{ marginTop: 8, alignItems: "flex-end" }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity
                         onPress={() => switchAiVersion(item.id)}
                         style={{
                          padding: 6,
                          borderRadius: 8
                          }}
                        >
                       <Ionicons
                         name="swap-horizontal"
                         size={18}
                         color="#fff"
                        />
                       </TouchableOpacity>
                      </View>
                      <View style={{ alignSelf: "flex-end", marginTop: 5 }}>
                        <Text style={{ color: "#aaa", fontSize: 11 }}>
                            {item.currentVersion + 1}/
                            {(item.previousVersions?.length || 0) + 1}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginHorizontal: 5, marginBottom: 5, gap: 10 }}>
            <TouchableOpacity onPress={() => copyText(item.text)} style={{ padding: 6 }}>
              <Ionicons name="copy-outline" size={18} color="#fff" />
            </TouchableOpacity>
            {isUser ? (
              <TouchableOpacity onPress={() => editMessage(item)} style={{ padding: 6 }}>
                <Ionicons name="pencil-outline" size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={() => setAiFeedback(item.id, "like")} style={{ padding: 6 }}>
                  <Ionicons name={item.feedback === "like" ? "thumbs-up" : "thumbs-up-outline"} size={18} color={item.feedback === "like" ? "#0f8" : "#fff"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAiFeedback(item.id, "dislike")} style={{ padding: 6 }}>
                  <Ionicons name={item.feedback === "dislike" ? "thumbs-down" : "thumbs-down-outline"} size={18} color={item.feedback === "dislike" ? "#f55" : "#fff"} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };
const loadChatHistory = async () => {
    const history = await getLocalChats();
    if (history) {
      setMessages(history);
    }
  };

  const saveHistory = async () => {
    await saveChats (chats);
  };

  const [loaded] = useFonts({
      Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
      PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-VariableFont_wght.ttf'),
      Estedad: require('../assets/fonts/Estedad-VariableFont_wght.ttf'),
      });

  const playSound = async (source) => {
    try {
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Sound Error:", error);
    }
  };

  const playSound1 = () => playSound(require('../assets/sounds/message.mp3'));
  const playSound2 = () => playSound(require('../assets/sounds/conversation.mp3'));
  const playSound3 = () => playSound(require('../assets/sounds/ai message.mp3'));
  const playSound4 = () => playSound(require('../assets/sounds/click3.mp3'));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#202020" }}>
      <KeyboardAvoidingView 
        style={{ flex: 1, backgroundColor: "#202020" }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1, padding: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#202020",
              paddingVertical: 0,
              borderBottomWidth: 1,
              borderBottomColor: "#181818"
            }}
          >

           <TouchableOpacity
             onPress={() => {
               setMenu(true);
               playSound4();
             }}
             style={{
               marginLeft:10,
               padding:0,
               borderRadius: 0,
               justifyContent: "center",
               alignItems: "center",
              }} 
            >
             <Ionicons name="menu" size={25} color="#ffffff"/>
            </TouchableOpacity> 
            <Modal visible={menu} transparent={true} animationType="fade">
          
             <View style={{ flex: 1, flexDirection:"row",alignItems:"center" }} >
               <View 
                 style={{
                   width: "70%",
                   height: "90%",
                   padding: 20,
                   borderRadius: 10,
                   backgroundColor: "#3b3b3b",
                 }}
                >
                 <View style={{padding: 10, borderBottomWidth:1 ,borderBottomColor:"#2c2c2c", marginBottom: 20}}>
                   <Text style={{fontSize:20, color:"#ececec", fontFamily: "PlayfairDisplay"}}>{i18n.t("Conversations")}</Text>            
                 </View>
                 <View style={{flex:1 }}>
                   <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                    {chats.map(chat => (
                     <TouchableOpacity
                      key={chat.id}
                      onPress={() => {
                        openChat(chat)
                      }}
                      onLongPress={() => {
                        setSelectedChat(chat);
                        setLongPressMenu(true);
                      }}
                      style={{ padding:15, backgroundColor: chat.id === currentChatId ? "#555555" : "transparent", borderRadius: 10,}}
                     >
                       <View
                        style={{
                         flexDirection: "row",
                         alignItems: "center",
                        }}
                       >
                      {/* صورة الطبيب */}
                      {chat.doctorType && (
                      <Image
                        source={getDoctorImage(chat.doctorType)}
                        style={{
                         width: 28,
                         height: 28,
                         borderRadius: 14,
                         marginRight: 10,
                        }}
                      />
                      )}

                    {/* عنوان المحادثة */}
                      <Text
                       style={{
                        color: "#bbbbbb",
                        fontFamily: "Estedad",
                        flexShrink: 1,
                        }}
                      >
                       {chat.title}
                      </Text>
                      </View>
                       {chat.pinned && <Ionicons name="pin" size={16} color="#fff" style={{ position: 'absolute', right: 10, top: 10 }} />}
                     </TouchableOpacity>
                    ))}
                   </ScrollView>
                 </View>
                </View>            
                <TouchableOpacity
                  onPress={() => {
                    setMenu(false)
                  }}
                  style={{
                    width: "30%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.0)",
                  }}             
                />
             </View>
            </Modal>
            <Modal visible={longPressMenu} transparent={true} animationType="fade">
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                <View style={{ width: 250, backgroundColor: "#333", borderRadius: 10, padding: 20 }}>
                  <Text style={{ color: "#fff", fontSize: 18, marginBottom: 20, textAlign: "center" , fontFamily: "PlayfairDisplay"}}>{i18n.t("chat_options")}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      pinChatHandler(selectedChat?.id);
                    }}
                    style={{ padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <Ionicons name="pin" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontFamily: "Estedad" }}>{selectedChat?.pinned ? i18n.t("unpin_chat") : i18n.t("pin_chat")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      openRenameChatModal();
                    }}
                    style={{ padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <Ionicons name="pencil" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontFamily: "Estedad" }}>{i18n.t("edit_chat_name")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      confirmDeleteChat(selectedChat?.id);
                    }}
                    style={{ padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <Ionicons name="trash-bin" size={25} color="#f74a4a" />
                    <Text style={{ color: "#f74a4a", fontFamily: "Estedad" }}>{i18n.t("delete_chat")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setLongPressMenu(false);
                    }}
                    style={{ padding: 15, backgroundColor: "#31493b", borderRadius: 10, marginTop: 10, alignItems: "center" }}
                  >
                    <Text style={{ color: "#ffffff", fontFamily: "Estedad" }}>{i18n.t("cancel")}</Text>
                  </TouchableOpacity>
                  <Modal visible={chatToDelete !== null} transparent={true} animationType="fade">
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                      <View style={{ width: 300, backgroundColor: "#333", borderRadius: 10, padding: 20 }}>
                        <Text style={{ color: "#fff", fontSize: 18, marginBottom: 20, textAlign: "center", fontFamily: "Estedad" }}>{i18n.t("delete_message_confirmation")}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                          <TouchableOpacity
                            onPress={() => {
                              deleteMessage(chatToDelete);
                              setChatToDelete(null);
                            }}
                            style={{ padding: 10, backgroundColor: "#f74a4a", borderRadius: 10, alignItems: "center" }}
                          >
                            <Text style={{ color: "#ffffff", fontFamily: "Estedad" }}>{i18n.t("yes")}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {

                              setChatToDelete(null);
                            }}
                            style={{ padding: 10, backgroundColor: "#31493b", borderRadius: 10, alignItems: "center" }}
                          >
                            <Text style={{ color: "#ffffff", fontFamily: "Estedad" }}>{i18n.t("no")}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                </View>
              </View>
            </Modal>
            <Modal visible={renameChatModal} transparent={true} animationType="fade">
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                <View style={{ width: 300, backgroundColor: "#333", borderRadius: 10, padding: 20 }}>
                  <Text style={{ color: "#fff", fontSize: 18, marginBottom: 15, textAlign: "center", fontFamily: "Estedad" }}>{i18n.t("edit_chat_name")}</Text>
                  <TextInput
                    value={renameChatTitle}
                    onChangeText={setRenameChatTitle}
                    placeholder={i18n.t("chat_name")}
                    placeholderTextColor="#888"
                    style={{
                      color: "#fff",
                      borderWidth: 1,
                      borderColor: "#555",
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 15,
                    }}
                  />
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <TouchableOpacity
                      onPress={() => {
                        setRenameChatModal(false);
                      }}
                      style={{ padding: 12, backgroundColor: "#4e4e4e", borderRadius: 10, width: 130, alignItems: "center" }}
                    >
                      <Text style={{ color: "#fff", fontFamily: "Estedad" }}>{i18n.t("cancel")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        saveChatName();
                      }}
                      style={{ padding: 12, backgroundColor: "#1e4230", borderRadius: 10, width: 130, alignItems: "center" }}
                    >
                      <Text style={{ color: "#fff", fontFamily: "Estedad" }}>{i18n.t("save")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            <Modal visible={messageOptions} transparent={true} animationType="fade">
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
                <View style={{ width: 250, backgroundColor: "#333", borderRadius: 10, padding: 20 }}>
                  <Text style={{ color: "#fff", fontSize: 18, marginBottom: 20, textAlign: "center", fontFamily: "PlayfairDisplay" }}>{i18n.t("message_options")}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      copyMessage(selectedMessage?.text);
                    }}
                    style={{ padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <Ionicons name="copy" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontFamily: "Estedad" }}>{i18n.t("copy")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      editMessage(selectedMessage);
                    }}
                    style={{ padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <Ionicons name="pencil" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontFamily: "Estedad" }}>{i18n.t("edit")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setMessageOptions(false);
                    }}
                    style={{ padding: 15, backgroundColor: "#31493b", borderRadius: 10, marginTop: 10, alignItems: "center" }}
                  >
                    <Text style={{ color: "#ffffff", fontFamily: "Estedad" }}>{i18n.t("cancel")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Text 
             style={{
               fontSize:22,
               color:"#ffffff",
               textAlign:"left",
               padding:20,
                fontFamily: "PlayfairDisplay"
              }}
            >Velura Medical</Text>

           <TouchableOpacity
             onPress={() => {
               setDoctor(true);
               playSound4();
             }}
             style={{
               marginLeft: 10,
               padding: 8,
               borderRadius: 20,
               justifyContent: "center",
               alignItems: "center"
             }}
            >
             <Ionicons name="create-outline" size={20} color="#ffffff"/>
           </TouchableOpacity>
           <Modal visible={doctor} transparent={true} animationType="slide">
             <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 20,
                }}
              >
                <View 
                  style={{
                    width: "100%",
                    maxWidth: 360,
                    padding: 22,
                    backgroundColor: "#161616",
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    shadowColor: "#000",
                    shadowOpacity: 0.25,
                    shadowRadius: 16,
                    elevation: 16,
                  }}
                >
                  <View style={{paddingBottom: 10, borderBottomWidth:1 ,borderBottomColor:"rgba(255,255,255,0.08)", width: "100%"}}>
                    <Text style={{fontSize:18, fontWeight:"700", color:"#ffffff", fontFamily: "PlayfairDisplay"}}>{i18n.t("select_doctor_type")}</Text>
                  </View>
                  <View style={{marginTop:20}}>
                    {doctorTypes.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        toggleDoctorType(item.id);
                      }}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 16,
                        paddingHorizontal: 14,
                        borderRadius: 16,
                        backgroundColor : doctorType1 === item.id ? "#2b5c3d" : "#2f2f2f",
                        borderWidth: doctorType1 === item.id ? 1 : 0,
                        borderColor: doctorType1 === item.id ? "#79d49d" : "transparent",
                        shadowColor: "#000",
                        shadowOpacity: 0.14,
                        shadowRadius: 8,
                        elevation: 5,
                        marginBottom: 12,
                      }}
                    >
                      <View
                       style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 14,
                       }}
                      >
                      <Image
                      source={item.image}
                      style={{
                       width: 28,
                       height: 28,
                       resizeMode: "contain",
                      }}
                      />
                      </View>
                      <View style={{flex: 1}}>
                       <Text
                        style={{
                         color: "#f0f0f0",
                         fontFamily: "Estedad",
                         fontSize: 16,
                         marginBottom: 4,
                        }}
                       >
                        {i18n.t(`doctor_types.${item.id}`)}
                       </Text>
                       <Text style={{color: "#9a9a9a", fontSize: 12, fontFamily: "PlayfairDisplay"}}>{item.id.replace('_', ' ')}</Text>
                      </View>
                    </TouchableOpacity>  
                    ))}                    
                  </View>
                 
                  <TouchableOpacity 
                   onPress={() => {
                    playSound2();
                    if (doctorType1 === null) {
                      Alert.alert(i18n.t("select_doctor_alert"));
                      return;
                    }
                    setDoctor(false);
                    createNewChat();
                   }}
                   style={{
                     marginTop: 18,
                     padding: 16,
                     backgroundColor: "#1b3f32",
                     borderRadius: 24,
                     alignItems: "center",
                     shadowColor: "#000",
                     shadowOpacity: 0.18,
                     shadowRadius: 10,
                     elevation: 7,
                    }}
                  >
                    <Text style={{ color: "white", fontFamily: "Estedad", fontSize: 16 }}>{i18n.t("next")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              </ScrollView>
           </Modal>

           <TouchableOpacity
             onPress={() => {
               navigation.navigate(SCREENS.SETTING);
               playSound4();
             }}
             style={{
               marginLeft: 10,
               padding: 8,
               borderRadius: 20,
               justifyContent: "center",
               alignItems: "center"
              }}
            >
             <Ionicons name="settings-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
         </View>
    
         <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 10 }}
            inverted 
          />

          {loading && <ActivityIndicator size="small" color="green" />}
        

          {selectedImages.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 10, gap: 10 }}>
              {selectedImages.map((img, index) => (
                <View key={index} style={{ position: "relative" }}>
                  <Image
                    source={{ uri: img }}
                    style={{ width: 120, height: 120, borderRadius: 10 }}
                 />
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImages(prev => prev.filter((_, i) => i !== index));
                    }}
                    style={{
                     position: "absolute",
                     top: -10,
                     right: -10,
                     backgroundColor: "#000",
                     borderRadius: 15,
                     padding: 5
                    }}
                  >
                   <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
           </View>
          )}

          <View
            style={{
             flexDirection: "row",
             borderTopWidth: 1,
             borderTopColor: "#181818",
             borderRadius: 15,
             padding: 10
            }}
          >
           <View
             style={{
               flex: 1,
               flexDirection: "row",
               borderRadius: 20,
               backgroundColor: "#2b2b2b"
             }}
           >
             <TextInput
               value={message}
               onChangeText={setMessage}
               placeholder={i18n.t("questions")}
               placeholderTextColor="#575757"
               multiline={true}
               style={{
                 flex: 1,
                 borderWidth: 0,
                 borderRadius: 15,
                 padding: 15,
                 color: "#ffffff"
               }}
             />
             {/* <TouchableOpacity
               onPress={() => {
                 setFileMenu(true);
                 playSound4();
               }}
               style={{
                 padding: 10,
                 borderRadius: 20,
                 justifyContent: "center",
                 alignItems: "center",
               }}
              > 
               <Ionicons name="attach" size={25} color="#858585" />
             </TouchableOpacity>
             <Modal visible={fileMenu} transparent animationType="fade">
               <View style={{
                 flex: 1,
                 backgroundColor: "rgba(0,0,0,0.0)",
                 justifyContent: "center",
                 alignItems: "center"
                 }}
                >
                 <View style={{
                    width: 250,
                    backgroundColor: "#333",
                    borderRadius: 10,
                    padding: 20
                   }}
                  >
                   <TouchableOpacity
                     onPress={() => {
                       setFileMenu(false);
                       openCamera();
                      }}
                     style={{ padding: 15, flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                     <Ionicons name="camera" size={20} color="#fff" style={{ marginBottom: 5 }} />
                     <Text style={{ color: "#fff" }}>{i18n.t("take_photo")}</Text>
                   </TouchableOpacity>

                   <TouchableOpacity
                     onPress={() => {
                       setFileMenu(false);
                       openGallery();
                      }}
                     style={{ padding: 15, flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                     <Ionicons name="image" size={20} color="#fff" style={{ marginBottom: 5 }} />
                     <Text style={{ color: "#fff" }}>{i18n.t("choose_from_gallery")}</Text>
                   </TouchableOpacity>
                   <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>  
                     <TouchableOpacity
                       onPress={() => {
                         setFileMenu(false);
                       }}
                       style={{ padding: 10, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor:"#4e4e4e" , borderRadius: 10, marginTop: 5 }}
                     > 
                       <Ionicons name="close" size={20} color="#fff" style={{ marginBottom: 5 }} />
                       <Text style={{ color: "#fff" }}>{i18n.t("cancel")}</Text>
                     </TouchableOpacity>
                    </View>
                 </View>
               </View>
             </Modal> */}
           </View>

           <TouchableOpacity
             onPress={async () => {
              await playSound1();
              await sendMessage()
             }}
             style={{
               marginLeft: 10,
               backgroundColor: "#1b3f32",
               padding: 10,
               borderRadius: 20,
               justifyContent: "center",
               alignItems: "center",
               shadowColor: "#000000",
               shadowOpacity: 0.3,
               shadowRadius: 10,
               elevation: 10,
              }}
            >
             <Ionicons name="arrow-up" size={20} color="#ffffff" />
           </TouchableOpacity>
         </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
