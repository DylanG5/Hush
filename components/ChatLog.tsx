import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, Alert } from 'react-native';
import ChatMessage from './ChatMessage';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot,  getDoc, doc} from 'firebase/firestore';
import axios from 'axios';

const ChatLog = ({ route }) => {
    const { chatId, TGT} = route.params;
    console.log("chatID",chatId,"TGT",TGT);
    const uid = auth.currentUser.uid;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [key, setKey] = useState('');
    const keytest = 'yz0hffXIolYcMk+bq62p4VTViodFn9sRGqVfzstn44g=';
    const [databaseTGT, setTGT] = useState('');
    useEffect(() => {
        const fetchKey = async () => {
            try {
                const keyResponse = await fetch(`http://192.168.0.9:4000/get-chat-key/${chatId}/${uid}`);
                const keyData = await keyResponse.json();
                if (keyResponse.ok) {
                    console.log('Key fetched for encryption/decryption');
                    setKey(keyData);
                } else {
                    console.error('Failed to fetch key from KDC:', keyData);
                }
            } catch (error) {
                console.error('Error fetching key for chat:', error);
            }
        };
        const fetchDatabaseTGT = async () => {
                    try {
                        const docRef = doc(db, 'tickets', TGT);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            if (data && data.tgt) { // Check if data and data.tgt are not undefined
                                setTGT(data.tgt);
                            } else {
                                console.error('TGT document does not contain tgt field');
                            }
                        } else {
                            console.error('TGT document does not exist');
                        }
                    } catch (error) {
                        console.error('Error fetching TGT from database:', error);
                    }
                };
        fetchKey();
        fetchDatabaseTGT();
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
    }, [chatId, TGT]);

    const encryptMessage = async (messageText) => {
        try {
            const response = await axios.post('http://192.168.0.9:5000/encrypt', { message: messageText, key: keytest });
            return response.data.encrypted_message;
        } catch (error) {
            console.error('Error encrypting message:', error);
            return '';
        }
    };

    const decryptMessage = async (encryptedMessage) => {
        try {
            const response = await axios.post('http://192.168.0.9:5000/decrypt', { encrypted_message: encryptedMessage, key: keytest });
            return response.data.decrypted_message;
        } catch (error) {
            console.error('Error decrypting message:', error);
            return encryptedMessage;
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;
        if (TGT !== databaseTGT) {
                    Alert.alert('Error', 'Invalid TGT. Please log in again.');
                    return;
                }
                console.log("TGT confirmed")
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
