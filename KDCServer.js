const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const chatSessions = [];

function generateKey() {
  const key = crypto.randomBytes(32);
  return key.toString('base64');
}

function findSessionsByChatId(chatId) {
  return chatSessions.filter(session => session.chatId === chatId);
}

app.post('/register-agent', (req, res) => {
  const { chatId, agentId } = req.body;

  if (!chatId || !agentId) {
    return res.status(400).send('Chat ID and Agent ID are required');
  }

  const agentSession = chatSessions.find(session => session.chatId === chatId && session.agentId === agentId);
  if (agentSession) {
    return res.status(200).json(agentSession);
  }

  // Check if there are any existing sessions for this chatId
  const existingSessions = findSessionsByChatId(chatId);
  if (existingSessions.length > 0) {
    const session = { chatId, agentId, key: existingSessions[0].key };
    chatSessions.push(session);
    res.json(session);
  } else {
    // If this is the first agent for the chatId then generate a new key
    const key = generateKey();
    const session = { chatId, agentId, key };
    chatSessions.push(session);
    res.json(session);
  }
});

app.get('/get-chat-key/:chatId/:agentId', (req, res) => {
  const { chatId, agentId } = req.params;
  const session = chatSessions.find(s => s.chatId === chatId && s.agentId === agentId);

  if (!session) {
    return res.status(404).send('Session not found');
  }

  res.json(session);
});

function updateAllKeys() {
  console.log("Updating keys for all chat sessions...");

  // Find all unique chatIds
  const uniqueChatIds = [...new Set(chatSessions.map(session => session.chatId))];
  
  // Generate a new key for each unique chatId and update sessions
  uniqueChatIds.forEach(chatId => {
      const newKey = generateKey(); // Generate new key for this chatId
      chatSessions.forEach(session => {
          if (session.chatId === chatId) {
              session.key = newKey; // Update key for all sessions with this chatId
          }
      });
  });

  console.log("All keys updated.");
}

// Schedule key updates
const ONE_HOUR = 3600000;
setInterval(updateAllKeys, ONE_HOUR);

app.listen(port, () => {
  console.log(`KDC server listening at http://0.0.0.0:${port}`);
});