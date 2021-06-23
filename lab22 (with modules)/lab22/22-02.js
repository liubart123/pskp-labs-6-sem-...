const express = require('express');

const app = express();

//в passport кроме local strategy есть аткже и custom (там, вроде бы, передаётся запрос), так чт омонжо ей вопросльзоваться

const fs=  require('fs');

const jwt = require('jsonwebtoken');


const STATIC_FOLDER_PATH = require('path').join(__dirname, '/static');

//в консоли много ошибок, так как пытается вытянуть для .css и .js файлов bootstrap ещё и соотвутствующие .map
app.use('/static', express.static(STATIC_FOLDER_PATH, {
    //до установки данног освйоства он не мог найти файл, поэтому переходил в next, в котором тоже кидалась ошибка и засорялись логи
    //теперь просто 404, если не найдёт файл
    //https://stackoverflow.com/questions/38709864/nodejs-express-dealing-with-missing-static-files
    fallthrough: false
}))


app.use(express.urlencoded({
    extended: false
}))

//const credentials = require('./credentials.json');

const redisConfig = require('./redis.json');

const redis = require('redis');

const redisClient = redis.createClient({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password
})

const database = require('./database');

const {Op} = require('sequelize');

const secretKey = 'secret-key';

const SIGNUP_PATH = '/signup';
const LOGIN_PATH = '/login';
const REFRESH_TOKEN_PATH = '/refresh-token';
const RESOURCE_PATH = '/resource';

const ACCESS_TOKEN_NAME = 'access-token';
const REFRESH_TOKEN_NAME = 'refresh-token';

const ACCESS_TOKEN_TIME_TO_LIVE = 1000 * 60 * 10;
const REFRESH_TOKEN_TIME_TO_LIVE = 1000 * 60 * 60 * 24;

const TOKEN_PREFIX = 'jwt:';


const addTokensToCookies = (res, payload) => {

    let accessToken = jwt.sign(payload, secretKey, {
        expiresIn: '10m'
    });

    let refreshToken = jwt.sign(payload, secretKey, {
        expiresIn: '1d'
    });

    res.cookie(ACCESS_TOKEN_NAME, accessToken, {
        maxAge: ACCESS_TOKEN_TIME_TO_LIVE,
        path: '/',
        signed: true,
        httpOnly: true,
        sameSite: 'strict'
    })

    res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: REFRESH_TOKEN_TIME_TO_LIVE,
        path: REFRESH_TOKEN_PATH,
        signed: true,
        httpOnly: true
    })

}


// const validateToken = (req) => {

// }

const clearCookieByName = (res, name) => {
    res.clearCookie(name);
}


//нормального встроенног алгоритма для автоматического удаления токенов нет (так как не ключи используются)
//https://stackoverflow.com/questions/11810020/how-to-handle-session-expire-basing-redis/11815594#11815594
//вместо связки set'а и его функций (sismemberof и sadd) монжо использовать те же функции для работы с ключами (сложность одинаковая, а в дополнение можно будет также заадть время жизни для ключа)
const addTokenFromCookieToBlackList = (req, res, cookieName, timeToLive = 1) => {

    const token = req.signedCookies[cookieName];

    clearCookieByName(res, cookieName);

    //вариант с set'ом для токенов (все в одном месте)
    // redisClient.sadd('tokens'/*, oldAccessToken*/, token, (err, res) => {

    //     if (err) {
    //         console.error(err);
    //     }
    //     else {
    //         console.log(`${res} tokens added to black list`);
    //     }
    // });

    //const timeToLive  = ((cookieName == ACCESS_TOKEN_NAME)?ACCESS_TOKEN_TIME_TO_LIVE:REFRESH_TOKEN_TIME_TO_LIVE);

    //https://redis.io/commands/set
    //SET key value [EX seconds|PX milliseconds|EXAT timestamp|PXAT milliseconds-timestamp|KEEPTTL] [NX|XX] [GET]
    
    //получаю время для истечения в секундах, поэтмоу использую не PX, а EX
    redisClient.set(`${TOKEN_PREFIX}${token}`, '', 'EX', timeToLive, redis.print);
    
}

const checkIfTokenBlackListed = (req, cookieName, callback) => {

    const token = req.signedCookies[cookieName];

    //вариант с set'ом для токенов (все в одном месте)
    // redisClient.sismember('tokens', token, (err, isBlocked) => {

    //     callback(err, isBlocked);
       
    // })

    //тут всегда 1 ключ передаю, так что нормльно убедт сохранить те callback'и, Котоыре до этого создавал
    redisClient.exists(`${TOKEN_PREFIX}${token}`, (err, existsCount) => {
        callback(err, existsCount);
    })

}

const PORT = 3000;



const cookieParser = require('cookie-parser');

app.use(cookieParser(secretKey, {
    
}))


const redirectToResourceIfAuthenticated = (req, res, next) => {

    checkIfTokenBlackListed(req, ACCESS_TOKEN_NAME, (err, isBlocked) => {

        if (err) {
            console.error(err);
            
            //тут произошла ошибка по вине redis
            next();
        }
        else {
            if (isBlocked == 1) {

                res.clearCookie(ACCESS_TOKEN_NAME);
    
                //здесь заблокированный accessToken, так что смысла идти дальше нет
                return res.redirect(LOGIN_PATH);
            }
            else {
                try {

                    const accessToken = req.signedCookies[ACCESS_TOKEN_NAME];

                    let payload = jwt.verify(accessToken, secretKey);
            
                    return res.redirect(RESOURCE_PATH);
                }
                catch(err) {
                    //здесь случайно на самомго себя постоянно перенаправлял (когда токен не предоставлен)
                    //res.redirect(LOGIN_PATH);
                    //в данном случае монжо просто исолпьозвать next, так как здесь обработчики только на странипцы для аутентификации
                    next();

                    //н проверял
                    // const redirectURIParameter = require('querystring').stringify({REDIRECT_URI_PARAM_NAME: RESOURCE_PATH});
                    // const fullPath = require('path').join(REFRESH_TOKEN_NAME, redirectURIParameter)
                    // res.redirect(fullPath);
                }
            }
        }
        
    })

}


app.get('/tokens', (req, res, next) => {


    //вариант с set'ом для токенов (все в одном месте)
    // redisClient.smembers('tokens', (err, tokens) => {
    //     if (err) {
    //         console.error(err);
    //     }
    //     else {
    //         let responseText = tokens.join("<br />");
    //         res.send(responseText);
    //     }
    // })


    //здесь храню как blacklisted ACCESS, так и blacklisted REFRESH
    redisClient.keys(`*${TOKEN_PREFIX}*`, (err, tokens) => {
        if (err) {
            console.error(err);
        }
        else {
            let responseText = tokens.join("<br />");
            res.send(responseText);
        }
    })


})


app.get(SIGNUP_PATH, redirectToResourceIfAuthenticated, (req, res, next) => {
    fs.createReadStream('./form.html').pipe(res);
})

app.post(SIGNUP_PATH, (req, res, next) => {

    const {username, password} = req.body;

    database.models.User.create({username, password}, {
        
    })
    .then(created => {

        let newPayload = {username: created.username};

        addTokensToCookies(res, newPayload);

        //res.json(created);
        res.redirect(RESOURCE_PATH);
    })
    .catch(err => {
        console.error(err);
        res.status(400).send(err.message);
    })

})


app.get(LOGIN_PATH, redirectToResourceIfAuthenticated, (req, res, next) => {
    fs.createReadStream('./form.html').pipe(res);
})

app.post(LOGIN_PATH, (req, res, next) => {

    const {username, password} = req.body;

    database.models.User.findOne({
        where: {
            [Op.and]: [
                { username: username },
                { password: password }
            ]
        },
        rejectOnEmpty: true
    })
    .then(found => {

        let newPayload = {username: found.username};

        addTokensToCookies(res, newPayload);

        res.redirect(RESOURCE_PATH);
    })
    .catch(err => {
        res.redirect(LOGIN_PATH);
    })

})

const REDIRECT_URI_PARAM_NAME = 'redirect_uri';

app.get(REFRESH_TOKEN_PATH, (req, res, next) => {

    const oldRefreshToken = req.signedCookies[REFRESH_TOKEN_NAME];
    //не видит его
    //const oldAccessToken = req.signedCookies[ACCESS_TOKEN_NAME];

    try {

        checkIfTokenBlackListed(req, REFRESH_TOKEN_NAME, (err, isBlocked) => {
            if (err) {
                res.json(err);
            }
            else {
                if (isBlocked == 1) {
                    res.json({message: 'Your refresh token is blacklisted'});
                }
                else {
                    let oldPayload = jwt.verify(oldRefreshToken, secretKey, {

                    })
            
                    //https://redis.io/commands#set
                    // redisClient.sadd('tokens'/*, oldAccessToken*/, oldRefreshToken, (err, res) => {
                    //     console.log(`${res} tokens added to black list`);
                    // });

                    //0 - ReplyError: ERR invalid expire time in set, поэтмоу хотя бы секунду пусть живёт
                    const ttl = (oldPayload.exp - Date.now() / 1000 < 0)? 1: Math.round(oldPayload.exp - Date.now() / 1000);
            
                    addTokenFromCookieToBlackList(req, res, REFRESH_TOKEN_NAME, ttl);
            
            
                    //лишнюю информацию не записываю (там есть время окончания)
                    let newPayload = {
                        username: oldPayload.username
                    }
            
                    addTokensToCookies(res, newPayload);
            
            
                    //не проверял
                    // if (req.query[REDIRECT_URI_PARAM_NAME]) {
                    //     res.redirect(req.query[REDIRECT_URI_PARAM_NAME]);
                    // }
                    // else {
                        res.json({message: 'Successful update of access and refresh tokens'});
                    // }
                }
            }
        })

        

    }
    catch(err) {
        res.sendStatus(401);
    }
    
})

app.get(RESOURCE_PATH, async (req, res, next) => {

    checkIfTokenBlackListed(req, ACCESS_TOKEN_NAME, (err, isBlocked) => {

        if (err) {
            console.error(err);
        }
        else {
            if (isBlocked == 1) {

                res.clearCookie(ACCESS_TOKEN_NAME);
    
                res.redirect(LOGIN_PATH);
            }
            else {
                try { 

                    const accessToken = req.signedCookies[ACCESS_TOKEN_NAME];

                    let payload = jwt.verify(accessToken, secretKey);
            
                    res.send(`RESOURCE:<br />${payload.username}`);
                }
                catch(err) {
                    res.redirect(LOGIN_PATH);

                    //н проверял
                    // const redirectURIParameter = require('querystring').stringify({REDIRECT_URI_PARAM_NAME: RESOURCE_PATH});
                    // const fullPath = require('path').join(REFRESH_TOKEN_NAME, redirectURIParameter)
                    // res.redirect(fullPath);
                }
            }
        }
        
    })
    
})


//сюда всё равно не крепится refresh-token (по заданию), а крепить по арзным путям (не в пределах 1 иерархии) нельзя с помощью Path
app.get('/logout', (req, res, next) => {

    const accessToken = req.signedCookies[ACCESS_TOKEN_NAME];

    const oldPayload = jwt.verify(accessToken, secretKey);

    //date.now() возвращает в ms
    const ttl = (oldPayload.exp - Date.now() / 1000 < 0)? 1: Math.round(oldPayload.exp - Date.now()/1000);
    //внутри ещё и удаляет cookie
    addTokenFromCookieToBlackList(req, res, ACCESS_TOKEN_NAME, ttl);

    //redisClient.sadd('tokens', accessToken, redis.print);

    //clearCookieByName(ACCESS_TOKEN_NAME);

    // res.clearCookie("access-token");
    // res.clearCookie("refresh-token");

    res.redirect(LOGIN_PATH);
})


app.use((req, res, next) => {
    res.sendStatus(404);
})

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    next();
})

redisClient.on('connect', () => {

    console.log(`Connected to redis: ${redisClient.connected}`);

    app.listen(PORT, () => {
        console.log(`Server is listening on ${PORT} port`);
    })

})