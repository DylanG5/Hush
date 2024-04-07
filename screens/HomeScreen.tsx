import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, addDoc, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { auth, db } from "../firebaseConfig";

const HomeScreen = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [inputUserEmail, setInputUserEmail] = useState("");

    const { uid } = auth.currentUser;

    const fetchChats = async () => {
        const chatRooms = [];
        try {
            const chatsSnapshot = await getDocs(collection(db, "chats"));
            chatsSnapshot.forEach((chatDoc) => {
                const chatId = chatDoc.id;
                const members = chatDoc.data().members;
                if (members.includes(uid)) {
                    chatRooms.push({ id: chatId, ...chatDoc.data() });
                }
            });
            setChats(chatRooms);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []); 

    useFocusEffect(
        React.useCallback(() => {
            fetchChats();
        }, [])
    );

    const handleChatPress = async (chatId) => {
        try {
            const keyResponse = await fetch(`http://0.0.0.0:3000/get-chat-key/${chatId}/${uid}`);
            const keyData = await keyResponse.json();
            if (keyResponse.ok) {
                navigation.navigate("ChatLogScreen", { chatId, key: keyData.key });
            } else {
                console.error('Failed to fetch key from KDC:', keyData);
            }
        } catch (error) {
            console.error('Error fetching key for chat:', error);
        }
    };
    

    const handleCreateChat = async () => {
        
        const enteredUserEmail = await promptUserEmail();
        if (enteredUserEmail) {
            try {
               
                const userQuery = query(collection(db, "users"), where("information", "array-contains", enteredUserEmail));
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    
                    const userData = userSnapshot.docs[0].data();
                    const enteredUserId = userData.information[1];
                    const enteredUserEmail = userData.information[0]; 
               
                    const newChatRef = await addDoc(collection(db, "chats"), {
                        members: [uid, enteredUserId],
                        title: enteredUserEmail, 
                    });
                    const newChatId = newChatRef.id;

                    await registerWithKDC(newChatId, uid);
                    await registerWithKDC(newChatId, enteredUserId);
                   
                    navigation.navigate("ChatLogScreen", { chatId: newChatId});
                } else {
                    Alert.alert("User not found", "No user found with the provided email.");
                }
            } catch (error) {
                console.error("Error creating chat:", error);
            }
        }
    };
    
    const promptUserEmail = () => {
        return new Promise((resolve) => {
            Alert.prompt(
                "Enter User Email",
                "Please enter the email of the person you want to chat with:",
                [
                    {
                        text: "Cancel",
                        onPress: () => resolve(null),
                        style: "cancel",
                    },
                    {
                        text: "OK",
                        onPress: (userEmail) => resolve(userEmail),
                    },
                ],
                "plain-text"
            );
        });
    };
    const registerWithKDC = async (chatId, agentId) => {
        try {
            const response = await fetch('http://0.0.0.0:3000/register-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId, agentId }), // Register agent1
            });
            // Optionally, also register agent2 here or expect them to be registered when they open the chat
            console.log("Registered with KDC:", await response.json());
        } catch (error) {
            console.error("Error registering chat with KDC:", error);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={chats}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.button} onPress={() => handleChatPress(item.id)}>
                        <Text style={styles.buttonText}>{item.title}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
            />
            <TouchableOpacity style={styles.createChatButton} onPress={handleCreateChat}>
                <Text style={styles.createChatButtonText}>Create Chat</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#007bff",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 10,
        alignItems: "center",
    },
    container: {
        flex: 1,
        padding: 20,
        position: "relative",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    createChatButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#28a745",
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    createChatButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default HomeScreen;

