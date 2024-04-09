import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, TouchableHighlight } from "react-native";
import { collection, addDoc, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native"; 
import { auth, db } from "../firebaseConfig";

const HomeScreen = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [inputChatTitle, setInputChatTitle] = useState("");
    const [inputGroupTitle, setInputGroupTitle] = useState("");
    const [inputMember1Email, setInputMember1Email] = useState("");
    const [inputMember2Email, setInputMember2Email] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    
    const { uid } = auth.currentUser;
    const [tgt, setTGT] = useState("");
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
    useEffect(() => {
            const generateTGT = async () => {
                const randomString = Math.random().toString(36).substring(7); // Generate random string
                const tgt = uid + "_" + randomString;
                setTGT(tgt);
                const ticketDocRef = await addDoc(collection(db, 'Tickets'), {
                    tgt,
                    userId: uid,
                });
                console.log("TGT stored in Firestore with ID:", ticketDocRef.id);
            };
            generateTGT();
        }, [uid]);

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
                navigation.navigate("ChatLogScreen", { chatId, key: keyData.key,TGT: tgt});
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
        setIsCreatingGroup(false);
    };

    const handleCreateGroup = async () => {
        setModalVisible(true);
        setIsCreatingGroup(true);
    };

    const createChatOrGroup = async () => {
        if (isCreatingGroup) {
            if (inputMember1Email.trim() !== "" && inputMember2Email.trim() !== "" && inputGroupTitle.trim() !== "") {
                try {
                    const member1Query = query(collection(db, "users"), where("information", "array-contains", inputMember1Email));
                    const member1Snapshot = await getDocs(member1Query);
                    const member2Query = query(collection(db, "users"), where("information", "array-contains", inputMember2Email));
                    const member2Snapshot = await getDocs(member2Query);
                    
                    if (!member1Snapshot.empty && !member2Snapshot.empty) {
                        const member1Data = member1Snapshot.docs[0].data();
                        const member2Data = member2Snapshot.docs[0].data();
                        const member1Id = member1Data.information[1];
                        const member2Id = member2Data.information[1];
                        
                        const newChatRef = await addDoc(collection(db, "chats"), {
                            members: [uid, member1Id, member2Id],
                            title: inputGroupTitle,
                        });
                        const newChatId = newChatRef.id;

                        await registerWithKDC(newChatId, uid);
                        await registerWithKDC(newChatId, member1Id);
                        await registerWithKDC(newChatId, member2Id);

                        setModalVisible(false);
                        navigation.navigate("ChatLogScreen", { chatId: newChatId });
                    } else {
                        alert("One or both users not found.");
                    }
                } catch (error) {
                    console.error("Error creating group:", error);
                }
            }
        } else {
            if (inputMember1Email.trim() !== "" && inputChatTitle.trim() !== "") {
                try {
                    const userQuery = query(collection(db, "users"), where("information", "array-contains", inputMember1Email));
                    const userSnapshot = await getDocs(userQuery);
                    if (!userSnapshot.empty) {
                        const userData = userSnapshot.docs[0].data();
                        const enteredUserId = userData.information[1];
                        const enteredUserEmail = userData.information[0]; 
                        const newChatRef = await addDoc(collection(db, "chats"), {
                            members: [uid, enteredUserId],
                            title: inputChatTitle, 
                        });
                        const newChatId = newChatRef.id;

                        await registerWithKDC(newChatId, uid);
                        await registerWithKDC(newChatId, enteredUserId);
                        setModalVisible(false);
                        navigation.navigate("ChatLogScreen", { chatId: newChatId});
                    } else {
                        alert("User not found.");
                    }
                } catch (error) {
                    console.error("Error creating chat:", error);
                }
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
            <TouchableOpacity style={styles.createChatButton} onPress={handleCreateGroup}>
                <Text style={styles.createChatButtonText}>Create Group</Text>
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
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        {!isCreatingGroup ? (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Chat Title"
                                    onChangeText={(text) => setInputChatTitle(text)}
                                    value={inputChatTitle}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Member Email"
                                    onChangeText={(text) => setInputMember1Email(text)}
                                    value={inputMember1Email}
                                />
                            </>
                        ) : (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Group Title"
                                    onChangeText={(text) => setInputGroupTitle(text)}
                                    value={inputGroupTitle}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Member 1 Email"
                                    onChangeText={(text) => setInputMember1Email(text)}
                                    value={inputMember1Email}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Member 2 Email"
                                    onChangeText={(text) => setInputMember2Email(text)}
                                    value={inputMember2Email}
                                />
                            </>
                        )}
                        <TouchableHighlight
                            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                            onPress={createChatOrGroup}
                        >
                            <Text style={styles.textStyle}>Create {isCreatingGroup ? 'Group' : 'Chat'}</Text>
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
        backgroundColor: "#28a745",
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: "center",
        marginBottom: 10,
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
        marginVertical: 8,
        borderWidth: 1,
        padding: 10,
        width: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
});

export default HomeScreen;


