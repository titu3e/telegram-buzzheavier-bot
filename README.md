# Telegram BuzzHeavier File Uploader Bot

**Telegram BuzzHeavier File Uploader Bot** is an intuitive bot designed to seamlessly download files from Telegram chats and effortlessly upload them to BuzzHeavier. This bot simplifies file handling between Telegram and BuzzHeavier, streamlining the process for users.

---

## 🚀 Features

* **Effortless Integration**: Automatically download files from Telegram and upload directly to BuzzHeavier.
* **User-Friendly Commands**: Simple bot interactions make managing file transfers easy.
* **Proxy Support**: Secure and efficient downloading through optional proxy support.
* **Robust Error Handling**: Graceful management of file transfer issues with clear user feedback.

---

## 🛠️ Technologies Used

* **Node.js**: Runtime environment for server-side scripting.
* **Docker**: Containerization for easy deployment and scalability.
* **Telegram Bot API**: Communication between the bot and Telegram servers.
* **BuzzHeavier Integration**: Custom uploader to handle file transfers to BuzzHeavier.

### Dependencies:

* `axios`
* `dotenv`
* `node-telegram-bot-api`
* `telegram`

### Dev Dependencies:

* `nodemon`
* `rimraf`

---

## ⚙️ Installation

Follow these steps to set up your bot:

1. Clone the repository:

```bash
git clone https://github.com/alex5402/telegram-buzzheavier-bot.git
```

2. Navigate to the project directory:

```bash
cd telegram-buzzheavier-bot
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file and configure your credentials:

```env
TELEGRAM_TOKEN=your-telegram-bot-token
BUZZHEAVIER_API_KEY=your-buzzheavier-api-key
```

5. Start the bot:

```bash
npm start
```

## 🐳 Docker Deployment

Build the Docker image:

```bash
docker build -t telegram-buzzheavier-bot .
```

Run the Docker container:

```bash
docker run -d --env-file .env telegram-buzzheavier-bot
```

---

## 📚 Usage

Simply send any file to your Telegram bot. It automatically processes the file and uploads it to BuzzHeavier. You'll receive confirmation once the upload is complete.

---

## 🙌 Contribution

Your contributions are welcome! Please open issues and submit pull requests to enhance the bot.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

---

**Happy Uploading!** 🚀✨
