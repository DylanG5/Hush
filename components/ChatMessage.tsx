import { Text, View, StyleSheet } from "react-native"

const ChatMessage = (props) => {

    //const { text, uid, photoURL } = props.message;
    const text = props.msg
    const messageClass = 'sent'
    //const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
    return (<>
        <View style={styles.root}>
            <Text style={[styles.text, messageClass == 'sent' ? styles.sent : styles.received]}>{text}</Text>
        </View>
    </>)

}

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
        backgroundColor: "grayx",
        color: "black"
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