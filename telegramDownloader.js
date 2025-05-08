// telegramDownloader.js
require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION);

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

async function downloadTelegramFile(link, taskId, onProgress, activeTasks) {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.connect();
  const [username, msgId] = link.replace('https://t.me/', '').split('/');

  let message;
  try {
    message = (await client.getMessages(username, { ids: parseInt(msgId) }))[0];
  } catch (err) {
    if (err.message.includes('CHANNEL_PRIVATE')) {
      console.warn(`🔒 Not a member of ${username}, attempting to join...`);
      try {
        const entity = await client.getEntity(username);
        await client.invoke(new Api.channels.JoinChannel({ channel: entity }));
        console.log(`✅ Successfully joined ${username}`);
        message = (await client.getMessages(username, { ids: parseInt(msgId) }))[0];
      } catch (err) {
        if (err.message.includes('CHANNEL_PRIVATE')) {
          console.warn(`🔒 Not a member of ${username}, attempting to join...`);
          try {
            const entity = await client.getEntity(username).catch(getEntityErr => {
              console.error(`❌ Failed to resolve entity for ${username}:`, getEntityErr.message);
              throw new Error(`Channel may be private or invalid: ${username}`);
            });

            await client.invoke(
              new Api.channels.JoinChannel({ channel: entity })
            );

            console.log(`✅ Successfully joined ${username}`);
            message = (await client.getMessages(username, { ids: parseInt(msgId) }))[0];

          } catch (joinErr) {
            console.error('❌ JoinChannel failed:', joinErr.message);
            throw new Error(`Join failed: ${joinErr.message}`);
          }
        } else {
          console.error('❌ Unknown error while fetching message:', err.message);
          throw err;
        }
      }
    } else {
      throw err;
    }
  }

  if (!message || !message.media) {
    throw new Error('No media found in message');
  }

  const originalName = message.file?.name || crypto.randomUUID();
  const filePath = path.join(tempDir, originalName);

  let lastProgress = 0;
  const buffer = await client.downloadMedia(message.media, {
    progressCallback: (dl, total) => {
      if (!activeTasks.get(taskId)) {
        throw new Error('Download cancelled');
      }
      const percent = Math.floor((dl / total) * 100);
      if (percent - lastProgress >= 5) {
        onProgress(percent);
        lastProgress = percent;
      }
    },
  });

  fs.writeFileSync(filePath, buffer);
  await client.disconnect();

  return filePath;
}

module.exports = { downloadTelegramFile };
