const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(bodyParser.json());

// Telegram bot setup
const TELEGRAM_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });