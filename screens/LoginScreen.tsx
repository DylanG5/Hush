import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, SafeAreaView } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        console.log('signed in!')
        navigation.navigate('Home')
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        console.log('user doesnt exist')
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inputContainer}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          style={styles.input}
        />
      </View>

      <Pressable onPress={login} style={styles.button}>
        <Text>Log in</Text>
      </Pressable>
    </SafeAreaView>
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
    backgroundColor: "#CCCCFF",
    padding: 15,
    alignItems: "center",
    marginVertical: 10,
  },
});
export default LoginScreen;