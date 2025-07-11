import { Client, LocalAuth, Buttons, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

// Load book list
const books = JSON.parse(fs.readFileSync('./books.json', 'utf-8'));

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // 👈 essential for Railway
  }
});

// QR Code event
client.on('qr', (qr) => {
  console.log('📲 Scan the QR code below to link your WhatsApp:\n');
  qrcode.generate(qr, { small: true });
  console.log('\n⚠️ Leave this Railway log open until you scan!');
});

// Ready event
client.on('ready', () => {
  console.log('✅ Bot is ready and connected!');
});

// Message handling
client.on('message', async (msg) => {
  const text = msg.body.toLowerCase();

  // 🔍 Search command
  if (text.startsWith('search')) {
    const query = text.replace('search', '').trim();
    const found = books.find(book => book.title.toLowerCase().includes(query));

    if (found) {
      const button = new Buttons(
        `📘 Found: *${found.title}*`,
        [{ body: `download ${found.file}` }],
        'Library Bot',
        'Click to download'
      );
      await msg.reply(button);
    } else {
      msg.reply('❌ Sorry, book not found.');
    }
  }

  // 📥 Download command
  if (text.startsWith('download')) {
    const filename = text.replace('download', '').trim();
    const filepath = path.join('./media', filename);

    if (fs.existsSync(filepath)) {
      const media = MessageMedia.fromFilePath(filepath);
      await msg.reply(media);
    } else {
      msg.reply('📂 File not found. Make sure the name is correct.');
    }
  }

  // 🆘 Help command
  if (text === 'help') {
    msg.reply(`📚 *Library Bot Commands:*
- search <book title>
- download <file name>
- help`);
  }
});

// Start the client
client.initialize();
