import { Client, LocalAuth, Buttons, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

const books = JSON.parse(fs.readFileSync('./books.json', 'utf-8'));

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

client.on('qr', qr => {
  console.clear();
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('📚 Library Bot is ready!');
});

client.on('message', async msg => {
  const text = msg.body.toLowerCase();

  // If message starts with "search"
  if (text.startsWith('search')) {
    const query = text.replace('search', '').trim();

    const found = books.find(book =>
      book.title.toLowerCase().includes(query)
    );

    if (found) {
      const button = new Buttons(
        `📚 Found: ${found.title}`,
        [{ body: `download ${found.file}` }],
        'Library Bot',
        'Click to download'
      );

      await msg.reply(button);
    } else {
      msg.reply('❌ Book not found. Try another title.');
    }
  }

  // If message starts with "download"
  if (text.startsWith('download')) {
    const filename = text.replace('download', '').trim();
    const filepath = path.join('./media', filename);

    if (fs.existsSync(filepath)) {
      const media = MessageMedia.fromFilePath(filepath);
      await msg.reply(media);
    } else {
      msg.reply('📂 File not found.');
    }
  }

  // Help Menu
  if (text === 'help') {
    msg.reply(`📚 *Library Bot Commands:*
- search <book title>
- download <filename>
- help`);
  }
});