const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('node-krb5'); // Import the Kerberos client
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const chatSessions = [];
const kerberosClient = new Client();

function generateKey() {
  return crypto.randomBytes(16).toString('hex');
}

function findSessionsByChatId(chatId) {
  return chatSessions.filter(session => session.chatId === chatId);
}

app.post('/register-agent', async (req, res) => {
  const { chatId, agentId, username, password } = req.body;

  if (!chatId || !agentId || !username || !password) {
    return res.status(400).send('Chat ID, Agent ID, Username, and Password are required');
  }

  try {
    // Authenticate the user with Kerberos
    await kerberosClient.authenticate(username, password);

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
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
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
  console.log(`KDC server listening at http://0.0.0.0:${port}`);
});
