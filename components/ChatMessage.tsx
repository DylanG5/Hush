import { Text, View, StyleSheet } from "react-native"
import { auth } from "../firebaseConfig"

const ChatMessage = (props) => {
    // You now receive the decrypted text directly.
    const text = props.msg.text;
    const uid = props.msg.userID;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <View style={styles.root}>
            <Text style={[styles.text, messageClass === 'sent' ? styles.sent : styles.received]}>
                {text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        display: "flex",
        alignItems: "center",
        marginRight: 10,
        marginLeft: 10
    },
    sent: {
        flexDirection: "row-reverse",
        color: "white",
        backgroundColor: "blue",
        alignSelf: "flex-end",
    },
    received: {
        backgroundColor: "gray",
        color: "white",
        alignSelf: "flex-start"
    },
    text: {
        maxWidth: 500,
        marginBottom: 12,
        lineHeight: 24,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        position: "relative",
        textAlign: "center",
        borderRadius: 15,
        overflow: 'hidden'
    }
});

export default ChatMessage