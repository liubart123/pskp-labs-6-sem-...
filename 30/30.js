const TOKEN = '1877089328:AAE4jUCXwjmi5C23ACVsHCL7dv16HGfjKZ0';
// const TOKEN = '1877089328:AAE4jUCXwjmi5C23ACVsHCL7dv16HGfjkZ0';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TOKEN, {polling:true});

bot.onText(/(.)+/, msg =>{
    bot.sendMessage(msg.chat.id, 'echo: ' + msg.text);
});


