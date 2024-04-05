import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import ChatMessage from './ChatMessage';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import axios from 'axios';

const ChatLog = ({ route }) => {
    const { chatId } = route.params;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const TEST_KEY_BASE64 = 'yz0hffXIolYcMk+bq62p4VTViodFn9sRGqVfzstn44g=';

    useEffect(() => {
        const messagesRef = collection(db, "messages", chatId, "messages");
        const q = query(messagesRef, orderBy("timeSent"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = querySnapshot.docs.map(async doc => {
                const data = doc.data();
                const decryptedText = await decryptMessage(data.text);
                return { id: doc.id, ...data, text: decryptedText };
            });

            Promise.all(messagesData).then(setMessages);
        });

        return () => unsubscribe();
    }, [chatId]);

    const encryptMessage = async (messageText) => {
        try {
            const response = await axios.post('http://192.168.2.63:5000/encrypt', { message: messageText, key: TEST_KEY_BASE64 });
            return response.data.encrypted_message;
        } catch (error) {
            console.error('Error encrypting message:', error);
            return '';
        }
    };

    const decryptMessage = async (encryptedMessage) => {
        try {
            const response = await axios.post('http://192.168.2.63:5000/decrypt', { encrypted_message: encryptedMessage, key: TEST_KEY_BASE64 });
            return response.data.decrypted_message;
        } catch (error) {
            console.error('Error decrypting message:', error);
            return encryptedMessage; // Optionally handle this differently
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;
        const encryptedMessage = await encryptMessage(message);
        await addDoc(collection(db, "messages", chatId, "messages"), {
            text: encryptedMessage,
            timeSent: serverTimestamp(),
            userID: auth.currentUser.uid
        });
        setMessage("");
    };

    return (
        <View style={styles.container}>
            {messages.length > 0 ? messages.map(msg => <ChatMessage key={msg.id} msg={msg} />) : <Text>No messages</Text>}
            <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="Type a message" />
            <Pressable style={styles.button} onPress={sendMessage}><Text>Send</Text></Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
    },
    input: {
        backgroundColor: 'white',
        padding: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#CCCCFF',
        padding: 15,
        alignItems: 'center',
    },
});

export default ChatLog;
