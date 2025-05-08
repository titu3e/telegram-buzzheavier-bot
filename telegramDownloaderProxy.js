// telegramDownloader.js
require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION);

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

async function fetchProxyList() {
  const proxyUrl = process.env.PROXY_LIST_URL;
  const response = await axios.get(proxyUrl);
  return response.data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

async function tryDownload(link, taskId, onProgress, proxy) {
  const [username, msgId] = link.replace('https://t.me/', '').split('/');

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    proxy: proxy ? parseProxy(proxy) : undefined
  });

  await client.connect();

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
      } catch (joinErr) {
        console.error('❌ Failed to join or access channel:', joinErr.message);
        throw new Error('Failed to access private or inaccessible channel.');
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

function parseProxy(proxyUrl) {
  const match = proxyUrl.match(/^(http|socks4|socks5):\/\/(\S+):(\d+)$/);
  if (!match) return undefined;

  const typeMap = {
    socks5: 5,
    socks4: 4
  };

  return {
    ip: match[2],
    port: parseInt(match[3]),
    socksType: typeMap[match[1]] // must be number: 4 or 5
  };
}


async function downloadTelegramFile(link, taskId, onProgress) {
  const proxies = await fetchProxyList();
  for (let i = 0; i < proxies.length; i++) {
    try {
      console.log(`🔌 Trying proxy: ${proxies[i]}`);
      return await tryDownload(link, taskId, onProgress, proxies[i]);
    } catch (err) {
      console.warn(`⚠️ Proxy failed (${proxies[i]}): ${err.message}`);
    }
  }
  throw new Error('All proxies failed.');
}

module.exports = { downloadTelegramFile };// telegramDownloader.js
require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION);

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

async function fetchProxyList() {
  const proxyUrl = process.env.PROXY_LIST_URL;
  const response = await axios.get(proxyUrl);
  return response.data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

async function tryDownload(link, taskId, onProgress, proxy) {
  const [username, msgId] = link.replace('https://t.me/', '').split('/');

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    proxy: proxy ? parseProxy(proxy) : undefined
  });

  await client.connect();

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
      } catch (joinErr) {
        console.error('❌ Failed to join or access channel:', joinErr.message);
        throw new Error('Failed to access private or inaccessible channel.');
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

function parseProxy(proxyUrl) {
  const match = proxyUrl.match(/^(http|socks4|socks5):\/\/(\S+):(\d+)$/);
  if (!match) return undefined;

  const typeMap = {
    socks5: 5,
    socks4: 4
  };

  return {
    ip: match[2],
    port: parseInt(match[3]),
    socksType: typeMap[match[1]] // must be number: 4 or 5
  };
}


async function downloadTelegramFile(link, taskId, onProgress) {
  const proxies = await fetchProxyList();
  for (let i = 0; i < proxies.length; i++) {
    try {
      console.log(`🔌 Trying proxy: ${proxies[i]}`);
      return await tryDownload(link, taskId, onProgress, proxies[i]);
    } catch (err) {
      console.warn(`⚠️ Proxy failed (${proxies[i]}): ${err.message}`);
    }
  }
  throw new Error('All proxies failed.');
}

module.exports = { downloadTelegramFile };