import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Platform, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { TouchableOpacity, GestureHandlerRootView } from 'react-native-gesture-handler';
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();

// 🔐 OAuth Config
const CLIENT_ID = "442051601061-00ghrhjubvsjvg69ahlpjavt5lva6pqo.apps.googleusercontent.com";

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

// 🔹 Request Notifications Permission
async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return status === 'granted';
}

// 🔹 Request Microphone Permission
async function requestMicrophonePermission() {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

// 🔹 Check Permissions
async function checkPermissions() {
  const notif = await Notifications.getPermissionsAsync();
  const mic = await Audio.getPermissionsAsync();

  return {
    notifications: notif.status === 'granted',
    microphone: mic.status === 'granted',
  };
}

// 🔹 File Picker
async function pickAssignmentFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'application/msword', 'text/plain'],
  });

  if (result.canceled) {
    Alert.alert('No file selected');
  } else {
    const file = result.assets[0];
    Alert.alert('File selected', file.name);
    console.log('Selected file URI:', file.uri);
  }
}

export default function App() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // 🔥 OAuth Login Function
const loginWithGoogle = async () => {
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  console.log("Redirect URI:", redirectUri);

  const request = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    scopes: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.send",
    ],
    redirectUri,
    responseType: AuthSession.ResponseType.Token,
  });

  const result = await request.promptAsync(discovery);

  if (result.type === "success") {
    console.log(result);
    Alert.alert("Login Success ✅");
  } else {
    console.log(result);
    Alert.alert("Login Failed ❌");
  }
};
  // 🔥 Firebase Function
  const addTaskToFirebase = async () => {
    try {
      await addDoc(collection(db, "tasks"), {
        title: "Test Task",
        deadline: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Task saved to Firebase ✅");
    } catch (error) {
      console.log(error);
      Alert.alert("Error saving task ❌");
    }
  };

  const handleCheckPermissions = async () => {
    const result = await checkPermissions();

    if (!result.notifications) {
      Alert.alert('Notifications disabled', 'Please enable notifications!');
    }

    if (!result.microphone) {
      Alert.alert('Microphone disabled', 'Please enable microphone!');
    }

    setPermissionsGranted(result.notifications && result.microphone);
  };

  useEffect(() => {
    handleCheckPermissions();
  }, []);

  const handleFixPermissions = async () => {
    const notif = await requestNotificationPermission();
    const mic = await requestMicrophonePermission();

    if (notif && mic) {
      Alert.alert('Success', 'All permissions granted ✅');
      setPermissionsGranted(true);
    } else {
      Alert.alert('Permission Needed', 'Please allow all permissions.');
    }
  };

  const handleVoiceAssistant = () => {
    Alert.alert('Voice Assistant', '🎤 Start speaking...');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Guardian AI Mobile</Text>

        <Text>
          Status: {permissionsGranted ? 'Permissions Granted ✅' : 'Permissions Missing ❌'}
        </Text>

        <View style={styles.buttonsContainer}>
          
          {/* 🔐 LOGIN BUTTON */}
          <TouchableOpacity style={styles.button} onPress={loginWithGoogle}>
            <Text style={styles.buttonText}>🔐 Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleVoiceAssistant}>
            <Text style={styles.buttonText}>🎤 Voice Assistant</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={pickAssignmentFile}>
            <Text style={styles.buttonText}>📂 Pick Assignment File</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={addTaskToFirebase}>
            <Text style={styles.buttonText}>➕ Add Task (Firebase)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fixButton} onPress={handleFixPermissions}>
            <Text style={styles.buttonText}>⚙️ Fix Permissions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  buttonsContainer: { marginTop: 30 },
  button: {
    backgroundColor: '#4B9CE2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: 250,
    alignItems: 'center',
  },
  fixButton: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: 250,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});