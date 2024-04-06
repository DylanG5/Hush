import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { auth, db } from "../firebaseConfig";

const HomeScreen = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [inputUserId, setInputUserId] = useState("");

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

    const handleChatPress = (chatId) => {
        navigation.navigate("ChatLogScreen", { chatId });
    };

    const handleCreateChat = async () => {
        
        const enteredUserId = await promptUserId();
        if (enteredUserId) {
            try {
                // Create a new chat with current user and entered user as members
                const newChatRef = await addDoc(collection(db, "chats"), {
                    members: [uid, enteredUserId],
                    title: "New Chat", 
                });
                const newChatId = newChatRef.id;
                // Navigate to the newly created chat
                navigation.navigate("ChatLogScreen", { chatId: newChatId });
            } catch (error) {
                console.error("Error creating chat:", error);
            }
        }
    };

    const promptUserId = () => {
        return new Promise((resolve) => {
            Alert.prompt(
                "Enter User ID",
                "Please enter the user ID of the person you want to chat with:",
                [
                    {
                        text: "Cancel",
                        onPress: () => resolve(null),
                        style: "cancel",
                    },
                    {
                        text: "OK",
                        onPress: (userId) => resolve(userId),
                    },
                ],
                "plain-text"
            );
        });
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

