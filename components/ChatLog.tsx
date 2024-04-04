import { Pressable, TextInput, View, Text, StyleSheet } from "react-native"
import ChatMessage from "./ChatMessage"
import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth";
import app from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import { collection, getDocs, addDoc, serverTimestamp, onSnapshot, doc, orderBy, query } from "firebase/firestore";

const ChatLog = ({ route }) => {
    const { chatId } = route.params;
    console.log('chatID', chatId)
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, "messages", chatId, "messages"), orderBy("timeSent")), (querySnapshot) => {
            const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(messagesData);
        });

        return () => unsubscribe(); // Cleanup function to unsubscribe from snapshot listener
    }, []);



    // Unsubscribe from the snapshot listener when component unmounts


    console.log('messages:', messages)
    //const messages = ['hey', 'hello', 'how are you']
    const [message, setMessage] = useState("")


    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid } = auth.currentUser;
        try {
            await addDoc(collection(db, "messages", chatId, "messages"), {
                text: message,
                timeSent: serverTimestamp(),
                userID: uid
            })
            setMessage("");
        } catch (e) {

        }


    }

    return (
        <View>
            {messages && messages.length > 0 ? messages.map(msg => <ChatMessage key={msg.id} msg={msg} />) : <Text>No messages</Text>}
            <TextInput style={styles.inputContainer} value={message} onChangeText={setMessage} placeholder="type message here"></TextInput>
            <Pressable style={styles.button} onPress={sendMessage}>
                <Text>Send Message</Text>
            </Pressable>
        </View>
    )
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

export default ChatLog