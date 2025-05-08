// index.js
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { downloadTelegramFile } = require('./telegramDownloader');
const { uploadToBuzzHeavier } = require('./buzzUploader');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const AUTH_USERS = process.env.AUTHORIZED_USER_IDS.split(',').map(id => id.trim());

const activeTasks = new Map();

bot.onText(/\/upload (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const messageLink = match[1];

  if (!AUTH_USERS.includes(userId)) {
    return bot.sendMessage(chatId, '❌ You are not authorized to use this bot.');
  }

  if (!messageLink.startsWith('https://t.me/')) {
    return bot.sendMessage(chatId, '❌ Invalid Telegram link.');
  }

  const progressMsg = await bot.sendMessage(chatId, '🔄 Starting download...', {
    reply_markup: {
      inline_keyboard: [[{ text: '❌ Cancel', callback_data: `cancel_${msg.message_id}` }]],
    },
  });

  const taskId = progressMsg.message_id;
  activeTasks.set(taskId, true);

  try {
    const filePath = await downloadTelegramFile(
      messageLink,
      taskId,
      (status) => {
        bot.editMessageText(`⬇️ Downloading: ${status}%`, {
          chat_id: chatId,
          message_id: progressMsg.message_id,
          reply_markup: {
            inline_keyboard: [[{ text: '❌ Cancel', callback_data: `cancel_${msg.message_id}` }]],
          },
        });
      },
      activeTasks
    );

    if (!activeTasks.get(taskId)) throw new Error('Cancelled');

    bot.editMessageText('⬆️ Uploading to BuzzHeavier...', {
      chat_id: chatId,
      message_id: progressMsg.message_id,
    });

    const result = await uploadToBuzzHeavier(filePath, (status) => {
      bot.editMessageText(`⬆️ Uploading: ${status}%`, {
        chat_id: chatId,
        message_id: progressMsg.message_id,
      });
    });

    bot.editMessageText(`✅ Upload complete!\n${result}`, {
      chat_id: chatId,
      message_id: progressMsg.message_id,
    });
  } catch (err) {
    console.error('❌ Task failed:', err.message);
    bot.editMessageText(`❌ Task failed: ${err.message}`, {
      chat_id: chatId,
      message_id: progressMsg.message_id,
    });
  }

  activeTasks.delete(taskId);
});

bot.on('callback_query', (query) => {
  if (query.data.startsWith('cancel_')) {
    const messageId = parseInt(query.data.split('_')[1]);
    activeTasks.set(messageId, false);
    bot.editMessageText('❌ Cancelled by user.', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
    });
  }
});