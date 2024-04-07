import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, SafeAreaView, Alert } from "react-native";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const auth = getAuth();

    const login = () => {
      signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              console.log('Signed in!');
              navigation.navigate('Home');
          })
          .catch((error) => {
              console.error('Login error', error.message);
              if (error.code === 'auth/user-not-found') {
                  // Prompt the user to create an account
                  Alert.alert(
                      "Account Not Found",
                      "No account found with this email. Would you like to create an account?",
                      [
                          {
                              text: "Yes",
                              onPress: () => createAccount(),
                          },
                          {
                              text: "No",
                          },
                      ]
                  );
              } else {
                  // Handle other errors differently
                  Alert.alert("Login Failed", error.message);
              }
          });
  };

    const createAccount = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('Account created!');
                navigation.navigate('Home');
            })
            .catch((error) => {
                console.error('Failed to create account', error.message);
                Alert.alert("Account Creation Failed", error.message);
            });
    };

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.inputContainer}>
                <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} />
            </View>
            <View style={styles.inputContainer}>
                <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} secureTextEntry />
            </View>
            <Pressable onPress={login} style={styles.button}>
                <Text>Log in</Text>
            </Pressable>
            <Pressable onPress={createAccount} style={styles.button}>
                <Text>Create Account</Text>
            </Pressable>
        </SafeAreaView>
    );
};




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
    backgroundColor: "#CCCCFF",
    padding: 15,
    alignItems: "center",
    marginVertical: 10,
  },
});
export default LoginScreen;