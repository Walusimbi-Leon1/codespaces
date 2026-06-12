const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3030;
const CHROMIUM_PATH = '/home/codespace/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── State ────────────────────────────────────────────────────
let qrCode = null;
let clientReady = false;
let messages = [];
let contacts = new Map();

// ─── WhatsApp Client ───────────────────────────────────────────
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
    puppeteer: {
        headless: true,
        executablePath: CHROMIUM_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    }
});

client.on('qr', (qr) => {
    qrCode = qr;
    clientReady = false;
    broadcast({ type: 'qr', qr });
    console.log('📱 QR code generated - scan with your phone');
});

client.on('ready', () => {
    qrCode = null;
    clientReady = true;
    broadcast({ type: 'ready' });
    console.log('✅ WhatsApp connected!');
});

client.on('authenticated', () => {
    console.log('🔐 WhatsApp authenticated');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Auth failure:', msg);
    broadcast({ type: 'error', message: 'Authentication failed. Please restart and scan QR again.' });
});

client.on('disconnected', (reason) => {
    clientReady = false;
    console.log('❌ Disconnected:', reason);
    broadcast({ type: 'disconnected', reason });
});

client.on('message', async (msg) => {
    const contact = await msg.getContact();
    const name = contact.name || contact.pushname || msg.from;
    const chat = await msg.getChat();
    
    const message = {
        id: msg.id._serialized,
        from: msg.from,
        fromMe: msg.fromMe,
        name: name,
        body: msg.body,
        timestamp: msg.timestamp * 1000,
        chatName: chat.name
    };
    
    messages.push(message);
    broadcast({ type: 'message', message });
    console.log(`💬 ${name}: ${msg.body.substring(0, 60)}`);
});

client.on('message_create', (msg) => {
    if (msg.fromMe) {
        messages.push({
            id: msg.id._serialized,
            from: msg.from,
            fromMe: true,
            name: 'You',
            body: msg.body,
            timestamp: msg.timestamp * 1000
        });
    }
});

// ─── WebSocket Broadcast ──────────────────────────────────────
function broadcast(data) {
    const json = JSON.stringify(data);
    wss.clients.forEach((ws) => {
        if (ws.readyState === 1) ws.send(json);
    });
}

// ─── API Routes ────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
    res.json({ ready: clientReady, hasQr: !!qrCode, messageCount: messages.length });
});

app.get('/api/qr', (req, res) => {
    if (qrCode) {
        res.json({ qr: qrCode });
    } else {
        res.json({ qr: null });
    }
});

app.get('/api/messages', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({ messages: messages.slice(-limit) });
});

app.post('/api/send', async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) return res.status(400).json({ error: 'Missing "to" or "message"' });
    
    try {
        const formatted = to.includes('@c.us') ? to : `${to}@c.us`;
        const response = await client.sendMessage(formatted, message);
        res.json({ success: true, id: response.id._serialized });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/send-to-chat', async (req, res) => {
    const { chatId, message } = req.body;
    if (!chatId || !message) return res.status(400).json({ error: 'Missing chatId or message' });
    
    try {
        const response = await client.sendMessage(chatId, message);
        res.json({ success: true, id: response.id._serialized });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/chats', async (req, res) => {
    if (!clientReady) return res.json({ chats: [] });
    try {
        const chats = await client.getChats();
        const result = chats.slice(0, 30).map(c => ({
            id: c.id._serialized,
            name: c.name,
            unreadCount: c.unreadCount,
            timestamp: c.timestamp * 1000
        }));
        res.json({ chats: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/contacts', async (req, res) => {
    if (!clientReady) return res.json({ contacts: [] });
    try {
        const contacts_list = await client.getContacts();
        const result = contacts_list.slice(0, 50).map(c => ({
            id: c.id._serialized,
            name: c.name || c.pushname || c.number,
            number: c.number
        }));
        res.json({ contacts: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Web UI Index ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Initialize ────────────────────────────────────────────────
console.log('🟢 Starting WhatsApp Web Client...');
client.initialize();

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Web app running at http://0.0.0.0:${PORT}`);
    console.log(`📱 Open in browser to access WhatsApp`);
});
