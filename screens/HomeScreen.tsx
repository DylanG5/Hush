import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, TouchableHighlight } from "react-native";
import { collection, addDoc, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native"; 
import { auth, db } from "../firebaseConfig";

const HomeScreen = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [inputUserEmail, setInputUserEmail] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

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
            const keyResponse = await fetch(`http://192.168.0.9:4000/get-chat-key/${chatId}/${uid}`);
            const keyData = await keyResponse.json();
            
            if (keyResponse.ok) {
                navigation.navigate("ChatLogScreen", { chatId, key: keyData.key });
            } else {
                console.error('Failed to fetch key from KDC:', keyData);
            }
        } catch (error) {
            console.log('testtt');
            console.error('Error fetching key for chat:', error);
        }
    };

    const handleCreateChat = async () => {
        setModalVisible(true);
    };

    const createUserChat = async () => {
        if (inputUserEmail.trim() !== "") {
            try {
                const userQuery = query(collection(db, "users"), where("information", "array-contains", inputUserEmail));
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
                    setModalVisible(false);
                    navigation.navigate("ChatLogScreen", { chatId: newChatId});
                } else {
                    alert("User not found");
                }
            } catch (error) {
                console.error("Error creating chat:", error);
            }
        }
    };
    
    const registerWithKDC = async (chatId, agentId) => {
        try {
            const response = await fetch('http://192.168.0.9:4000/register-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId, agentId }),
            });
            
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter User Email"
                            onChangeText={(text) => setInputUserEmail(text)}
                            value={inputUserEmail}
                        />
                        <TouchableHighlight
                            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                            onPress={createUserChat}
                        >
                            <Text style={styles.textStyle}>Create Chat</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: '100%',
    }
});

export default HomeScreen;


