const TOKEN = '1206725435:AAEIwnSQAavIomK_1d6TT_ts-fhPqXtQpr0';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TOKEN, {polling:true});

bot.onText(/(.)/, msg =>{
    bot.sendMessage(msg.chat.id, 'echo: ' + msg.text);
});
