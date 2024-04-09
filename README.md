# How to Run Hush 

## Download Dependancies 

Make sure you have the right python dependancies downloaded: 
1. Flask
2. pycryptodome

Here is a guide on how to use PIP to download packages: 
https://packaging.python.org/en/latest/tutorials/installing-packages/ 

### Input your own IP Address in the following files: 
1. KDCServer.js Line 80
2. components/ChatLog.tsx Line 19, Line 52, Line 62
3. screens/HomeScreen.tsx Line 47, 

Once you have the aforementioned dependancies downloaded run the following commands: 

### Starting the encryption and decryption server
``` cd ./Hush/FlaskApp ```
#### Run the server.py in the terminal 
``` python server.py ```

### Using NPM to download dependancies 
``` npm install ```

### Starting the emulator
``` npx expo start ```

### Starting the KDC Server
``` node KDCServer.js ```

#### Scan the qr code displayed

### Code Breakdown
#### Root Directory:
- App.js - handles page navigation, and renders LoginScreen at beginning of program
- KDCServer.js - our KDC manager, handles generating keys, refreshing DB, and updating communicating agents

#### Screens Directory:
- contains different views for our app
- LoginScreen.tsx : displays login screen, and handles login attempts
- HomeScreen.tsx: will list chats after user is logged in, contains code to handle single chat and group chat creation
- ChatLogScreen.tsx: after opening a chat from HomeScreen, will load chat history and be able to send messages

#### Components Directory:
- contains reusable components that are used to render chats, 
- ChatLog.tsx: renders all messages and send message field
- ChatMessage.tsx: renders individual messages



