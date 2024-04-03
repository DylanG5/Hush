import { View } from "react-native"
import ChatMessage from "./ChatMessage"


const ChatLog = () => {
    const messages = ['hey', 'hello', 'how are you']

    return (
        <View>
            {messages.map(msg => <ChatMessage msg={msg} />)}
        </View>
    )
}

export default ChatLog