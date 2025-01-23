const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(bodyParser.json());

const TELEGRAM_TOKEN = "token";
const CHAT_ID = "chatID";
const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: false});

app.post('/webhook', async(req,res) =>{
  const {symbol, volume, avg_volume_15, avg_volume_1h} = req.body;

  if(volume > 1.5 * avg_volume_15 || volume > 1.5 * avg_volume_1h){
    try{
      const screenshotPath = await captureTradingViewChart(symbol);
      await sendTelegramAlert(symbol, volume, screenshotPath);
      res.status(200).send({status: "alert processed"});
    }
    catch (error){
      console.error('Error processing alert:', error);
      res.status(500).send({status: "error processing alert"});
    }
  }
  else {
    res.status(200).send({status: "volume threshold not met"});
  }
});