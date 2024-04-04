import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, SafeAreaView } from "react-native";
import { auth } from "./firebaseConfig.js"
import { signInWithEmailAndPassword } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen';
import ChatLogScreen from './screens/ChatLogScreen';



export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChatLogScreen" component={ChatLogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    margin: 10,
  },
  inputContainer: {
    backgroundColor: "white",
    padding: 10,
    marginVertical: 10,
  },
  input: {},
  button: {
    backgroundColor: "#256CFF",
    padding: 15,
    alignItems: "center",
    marginVertical: 10,
  },
});  
