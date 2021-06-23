
//name: PSCALab30Bot
//t.me/PSCALab30Bot
//tg://resolve?domain=PSCALab30Bot

//https://core.telegram.org/bots/api#available-methods

//https://www.npmjs.com/package/node-telegram-bot-api


const TelegramBot = require('node-telegram-bot-api');

const TOKEN = "1809391500:AAElAb_CZlgj70D1AMBw9XrET7R0dEzcU_g";

const bot = new TelegramBot(
    TOKEN, {
        polling: {
            interval: 250,
            autoStart: true,
            params: {
                timeout: 10
            }
        }//true
    }
)


function between(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

bot.onText(/\/random ([\d]+) ([\d]+)/, (message, [, from, to]) => {
    const {id} = message.chat;

    from = Number.parseInt(from);
    to = Number.parseInt(to);

    if (from > to) {
        [from, to] = [to, from];
    }

    const random = between(from, to);

    bot.sendMessage(id, random);
})


bot.onText(/\/decision[ ]?(.*)/, (message, [, decisionText]) => {
    const {id} = message.chat;

    const random = between(0, 2);

    const res = random?true:false;

    bot.sendMessage(id, `${decisionText? decisionText+': ' : ''}${res}`);
})

bot.onText(/\/(help|start)/, async (message) => {
    const {id} = message.chat;

    const me = await bot.getMe();

    let commands = await bot.getMyCommands();

    let text = `${me.first_name}:\n`;

    commands.forEach(com => {
        text += `/${com.command} - ${com.description}\n`;
    })

    bot.sendMessage(id, text);

    
})

bot.on('message', (message) => {
    console.log(message);

    if (!message.text.match(/^\/(start|random|decision|help)/)) {

        const html = `<strong>echo: </strong>${message.text}`

        bot.sendMessage(message.chat.id, html, {
            parse_mode: 'HTML',
            disable_notification: true
        })
        .then(message => {
            console.log(`Message ${message.message_id} has been sent`);
        })
        .catch(err => {
            console.error(err);
        })

    }

    
})
