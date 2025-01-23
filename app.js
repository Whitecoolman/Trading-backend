const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.token;
;
const CHAT_ID = process.env.chatID;
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

async function captureTradingViewChart(symbol){
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const url = `https://www.tradingview.com/chart/?symbol=${symbol}`;
  await page.goto(url, {waitUntil: "networkidle2"});
  
  const screenshotPath = `${symbol}_chart.png`;
  await page.screenshot({path:screenshotPath});
  await browser.close();

  return screenshotPath;
}

async function sendTelegramAlert(symbol, volume, screenshotPath){
  const message = `🚨 ${symbol} Alert!\nVolume: ${volume} exceeds 50% average.`;
  await bot.sendMessage(CHAT_ID, message);
  await bot.sendPhoto(CHAT_ID, screenshotPath);
}

const PORT = 5000;
app.listen(PORT, ()=>{
  console.log( `Server is running on port ${PORT}`);
});