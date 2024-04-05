const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const chatSessions = [];

function generateKey() {
  return crypto.randomBytes(16).toString('hex'); 
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

app.listen(port, () => {
  console.log(`KDC server listening at http://localhost:${port}`);
});
