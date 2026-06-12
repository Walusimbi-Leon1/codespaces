const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n📱 Scan this QR code with your WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n⚠️  Open WhatsApp on your phone → Settings → Linked Devices → Link a Device\n');
});

client.on('ready', () => {
    console.log('\n✅ WhatsApp connected successfully!');
    console.log('💬 Your bot is now ready to receive and send messages.\n');
});

client.on('message', async (message) => {
    console.log(`\n📩 ${message.from}: ${message.body}`);

    if (message.body.toLowerCase() === 'ping') {
        await message.reply('pong');
    } else if (message.body.toLowerCase() === 'hello') {
        await message.reply('Hello! This is Leon AI connected via WhatsApp 🤖');
    }
});

client.initialize();
