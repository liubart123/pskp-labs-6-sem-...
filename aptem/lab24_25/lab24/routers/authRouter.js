const express = require('express');

module.exports = (app) => {

    //const app = express();

    //в passport кроме local strategy есть аткже и custom (там, вроде бы, передаётся запрос), так чт омонжо ей вопросльзоваться

    const fs=  require('fs');

    const path = require('path');



    const jwt = require('jsonwebtoken');



    //именно в таком порядке работает путь в родительский каталог (пробовал и иначе,н о были ошибки (может бытЬ, это и возмонжо сдлетаь по-другому))
    const SIGNIN_FORM_FILE_PATH = path.join(__dirname, '..', 'signin.html');

    const SIGNUP_FORM_FILE_PATH = path.join(__dirname, '..', 'signup.html');

    const STATIC_FOLDER_PATH = path.join(__dirname, '..', 'static');

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

    const redisConfig = require('../redis.json');

    const redis = require('redis');

    const redisClient = redis.createClient({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password
    })

    const database = require('../database');

    const {Op} = require('sequelize');

    const secretKey = require('../jwt.json')["secret-key"];

    const SIGNUP_PATH = '/signup';
    const LOGIN_PATH = '/login';
    const REFRESH_TOKEN_PATH = '/refresh-token';
    const RESOURCE_PATH = '/resource';

    const ACCESS_TOKEN_NAME = require('../jwt.json')["access-token"];
    const REFRESH_TOKEN_NAME = 'refresh-token';

    const ACCESS_TOKEN_TIME_TO_LIVE = 1000 * 60 * 10;
    const REFRESH_TOKEN_TIME_TO_LIVE = 1000 * 60 * 60 * 24;

    const TOKEN_PREFIX = 'jwt:';


    const addTokensToCookies = (res, payload) => {

        //для наглядности и удобства просмотра blacklist'а добавил ещё и тип токена
        let accessToken = jwt.sign({token_type: 'access_token', ...payload}, secretKey, {
            expiresIn: '10m'
        });

        let refreshToken = jwt.sign({token_type: 'refresh_token', ...payload}, secretKey, {
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




    const clearCookieByName = (res, name) => {
        res.clearCookie(name);
    }


    //нормального встроенног алгоритма для автоматического удаления токенов нет (так как не ключи используются)
    //https://stackoverflow.com/questions/11810020/how-to-handle-session-expire-basing-redis/11815594#11815594
    //вместо связки set'а и его функций (sismemberof и sadd) монжо использовать те же функции для работы с ключами (сложность одинаковая, а в дополнение можно будет также заадть время жизни для ключа)
    const addTokenFromCookieToBlackList = (req, res, cookieName, timeToLive = 1) => {

        const token = req.signedCookies[cookieName];

        clearCookieByName(res, cookieName);

        //вариант с set'ом для токенов (все токены в одном месте, но нельзя в нормальном виде задать время жизни)
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
        
        return new Promise((resolve, reject) => {
            redisClient.set(`${TOKEN_PREFIX}${token}`, '', 'EX', timeToLive, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        })
        

        //redisClient.sadd('tokens', token, redis.print);

        //https://redis.io/commands#set
        // redisClient.sadd('tokens'/*, oldAccessToken*/, token, (err, res) => {
        //     console.log(`${res} tokens added to black list`);
        // });
        
    }

    const checkIfTokenBlackListed = (req, cookieName, callback) => {

        const token = req.signedCookies[cookieName];

        //вариант с set'ом для токенов (все в одном месте)
        // redisClient.sismember('tokens', token, (err, isBlocked) => {

        //     callback(err, isBlocked);
        
        // })

        //тут всегда 1 ключ передаю, так что нормльно убедт сохранить те callback'и, Котоыре до этого создавал
        redisClient.exists(`${TOKEN_PREFIX}${token}`, (err, existsCount) => {
            callback(err, existsCount != 0);
        })

    }


    // const validateToken = (req, cookieName, callback) => {

    //     try {
    //         const token = req.signedCookies[cookieName];

    //         const payload = jwt.verify(token, secretKey);

    //         checkIfTokenBlackListed(req, cookieName, (err, isBlackListed) => {
    //             if (err) {
    //                 callback(err, null);
    //             }
    //             else if (isBlackListed) {
    //                 callback(new Error('token is blacklisted'), null);
    //             }
    //             else {
    //                 callback(null, payload);
    //             }
    //         })
    //     }
    //     catch (err) {
    //         callback(err, null);
    //     }

    // }

    //сделал для того, чтобы можно было await и последовательно добавить в blacklist refresh и access при '/refresh-token'
    //иначе асинхронно работали, а при добавлении в blacklist у меня ещё и удаляется cookie, а это заголовок
    //может удалиться refresh_token (и добавиться в blacklist), затем отправиться ответ (что была получена новая пара token'ов),
    //а затем асинхронно попытается удалить cookie с access, тогда будет ошибка:
    //Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    const validateTokenPromise = (req, cookieName) => {

        return new Promise((resolve, reject) => {
            try {
                const token = req.signedCookies[cookieName];
        
                const payload = jwt.verify(token, secretKey);
        
                checkIfTokenBlackListed(req, cookieName, (err, isBlackListed) => {
                    if (err) {
                        reject(err);
                        //callback(err, null);
                    }
                    else if (isBlackListed) {
                        reject(new Error('token is blacklisted'));
                        //callback(new Error('token is blacklisted'), null);
                    }
                    else {
                        resolve(payload);
                        //callback(null, payload);
                    }
                })
            }
            catch (err) {
                reject(err);
                //callback(err, null);
            }
        })
        

    }



    //const PORT = 3000;



    const cookieParser = require('cookie-parser');

    app.use(cookieParser(secretKey, {
        
    }))


    const redirectToResourceIfAuthenticated = (req, res, next) => {

        validateTokenPromise(req, ACCESS_TOKEN_NAME)
        .then(tokenPayload => {
            res.redirect(RESOURCE_PATH);
        })
        .catch(err => {
            console.error(err);

            clearCookieByName(res, ACCESS_TOKEN_NAME);

            //тут произошла ошибка по вине redis или же
            //заблокированный accessToken, так что смысла идти дальше нет
            
            //в данном случае монжо просто исолпьозвать next, так как здесь обработчики только на странипцы для аутентификации
            //здесь случайно на самомго себя постоянно перенаправлял (когда токен не предоставлен)
            //res.redirect(LOGIN_PATH);
            //в данном случае монжо просто исолпьозвать next, так как здесь обработчики только на странипцы для аутентификации
            next();
        })

        // validateToken(req, ACCESS_TOKEN_NAME, (err, tokenPayload) => {
        //     if (err) {
        //         console.error(err);

        //         clearCookieByName(res, ACCESS_TOKEN_NAME);
        
        //         //тут произошла ошибка по вине redis или же
        //         //заблокированный accessToken, так что смысла идти дальше нет
                
        //         //в данном случае монжо просто исолпьозвать next, так как здесь обработчики только на странипцы для аутентификации
        //         //здесь случайно на самомго себя постоянно перенаправлял (когда токен не предоставлен)
        //         //res.redirect(LOGIN_PATH);
        //         //в данном случае монжо просто исолпьозвать next, так как здесь обработчики только на странипцы для аутентификации
        //         next();
        //     }
        //     else {
        //         res.redirect(RESOURCE_PATH);
        //     }
        // })

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





    const pipeFileToResByPath = (res, filePath) => {
        fs.access(filePath, fs.constants.R_OK, (err) => {
            if (err) {
                console.error(err);

                res.status(500).send('cannot get file');
            }
            else {
                fs.createReadStream(filePath).pipe(res);
            }
        })
    }


    app.get(SIGNUP_PATH, redirectToResourceIfAuthenticated, (req, res, next) => {
        pipeFileToResByPath(res, SIGNUP_FORM_FILE_PATH);
    })

    app.post(SIGNUP_PATH, (req, res, next) => {

        const {username, password, email} = req.body;

        database.models.User.create({username, password, email: email || null}, {
            
        })
        .then(created => {

            //TODO: добавил роль (role)
            let newPayload = {id: created.id, username: created.username, role: created.role};

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
        pipeFileToResByPath(res, SIGNIN_FORM_FILE_PATH);
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

            //TODO: добавил роль (role)
            let newPayload = {id: found.id, username: found.username, role: found.role};

            addTokensToCookies(res, newPayload);

            res.redirect(RESOURCE_PATH);
        })
        .catch(err => {
            res.redirect(LOGIN_PATH);
        })

    })

    //const REDIRECT_URI_PARAM_NAME = 'redirect_uri';

    //здесь вполне нормальная ситуация, если у него не будет access_token'а
    app.get(REFRESH_TOKEN_PATH, async (req, res, next) => {

        //const oldRefreshToken = req.signedCookies[REFRESH_TOKEN_NAME];
        //также желательно здесь добавить и access_token в blacklist (хоть он и может отсутствовать)
        //const oldAccessToken = req.signedCookies[ACCESS_TOKEN_NAME];

        let blackListingPromises = [];

        //try {

            validateTokenPromise(req, REFRESH_TOKEN_NAME)
            .then(async (tokenPayload) => {
                //https://redis.io/commands#set
                // redisClient.sadd('tokens'/*, oldAccessToken*/, oldRefreshToken, (err, res) => {
                //     console.log(`${res} tokens added to black list`);
                // });

                //0 - ReplyError: ERR invalid expire time in set, поэтмоу хотя бы секунду пусть живёт
                const ttl = (tokenPayload.exp - Date.now() / 1000 < 0)? 1: Math.round(tokenPayload.exp - Date.now() / 1000);
        
                blackListingPromises.push(addTokenFromCookieToBlackList(req, res, REFRESH_TOKEN_NAME, ttl));
        
        
                //лишнюю информацию не записываю (там есть время окончания)
                //TODO: добавил роль (role)
                let newPayload = {
                    id: tokenPayload.id,
                    username: tokenPayload.username,
                    role: tokenPayload.role
                }

                //пришлось перейти к try-catch с await, чтобы гарантировать порядок выполнения и добавление в массив обоих промисов
                try {
                    const accessTokenPayload = await validateTokenPromise(req, ACCESS_TOKEN_NAME);

                    //https://redis.io/commands#set
                    // redisClient.sadd('tokens'/*, oldAccessToken*/, oldRefreshToken, (err, res) => {
                    //     console.log(`${res} tokens added to black list`);
                    // });

                    //0 - ReplyError: ERR invalid expire time in set, поэтмоу хотя бы секунду пусть живёт
                    const ttl = (accessTokenPayload.exp - Date.now() / 1000 < 0)? 1: Math.round(accessTokenPayload.exp - Date.now() / 1000);
            
                    blackListingPromises.push(addTokenFromCookieToBlackList(req, res, ACCESS_TOKEN_NAME, ttl));
                }
                catch(err) {
                    console.error(err);
                    //тут и не важно, что нет access. Если же будет, то было бы хорошо его удалить и добавить в blacklist
                }
                

                Promise.all(blackListingPromises)
                .then(resultsOfBlackListing => {
                    console.dir(resultsOfBlackListing);

                    addTokensToCookies(res, newPayload);

                    //не проверял
                    // if (req.query[REDIRECT_URI_PARAM_NAME]) {
                    //     res.redirect(req.query[REDIRECT_URI_PARAM_NAME]);
                    // }
                    // else {
                        res.json({message: 'Successful update of access and refresh tokens'});
                    // }
                })
                .catch((err) => {
                    //не смог добавить в blacklist какой-то из токенов
                    console.error(err);
                    res.json({message: 'refresh_token/access_token/both cannot be blacklisted because of error'});
                })
            
            })
            .catch(err => {
                console.error(err);

                //в задании написано, что должен "возвращать статус 401"
                res.sendStatus(401);
            })

            // validateToken(req, REFRESH_TOKEN_NAME, (err, tokenPayload) => {
            //     if (err) {
            //         console.error(err);

            //         //в задании написано, что должен "возвращать статус 401"
            //         res.sendStatus(401);
            //     }
            //     else {

            //         //https://redis.io/commands#set
            //         // redisClient.sadd('tokens'/*, oldAccessToken*/, oldRefreshToken, (err, res) => {
            //         //     console.log(`${res} tokens added to black list`);
            //         // });

            //         //0 - ReplyError: ERR invalid expire time in set, поэтмоу хотя бы секунду пусть живёт
            //         const ttl = (tokenPayload.exp - Date.now() / 1000 < 0)? 1: Math.round(tokenPayload.exp - Date.now() / 1000);
            
            //         addTokenFromCookieToBlackList(req, res, REFRESH_TOKEN_NAME, ttl);
            
            
            //         //лишнюю информацию не записываю (там есть время окончания)
            //         let newPayload = {
            //             id: tokenPayload.id,
            //             username: tokenPayload.username
            //         }




            //         validateToken(req, ACCESS_TOKEN_NAME, (err, tokenPayload) => {
            //             if (err) {
            //                 console.error(err);
            //                 //тут и не важно, что нет access. Если же будет, то было бы хорошо его удалить и добавить в blacklist
            //             }
            //             else {
            
            //                 //https://redis.io/commands#set
            //                 // redisClient.sadd('tokens'/*, oldAccessToken*/, oldRefreshToken, (err, res) => {
            //                 //     console.log(`${res} tokens added to black list`);
            //                 // });
            
            //                 //0 - ReplyError: ERR invalid expire time in set, поэтмоу хотя бы секунду пусть живёт
            //                 const ttl = (tokenPayload.exp - Date.now() / 1000 < 0)? 1: Math.round(tokenPayload.exp - Date.now() / 1000);
                    
            //                 addTokenFromCookieToBlackList(req, res, ACCESS_TOKEN_NAME, ttl);
                            
            //             }
            //         })


            
            //         addTokensToCookies(res, newPayload);
            
            
            //         //не проверял
            //         // if (req.query[REDIRECT_URI_PARAM_NAME]) {
            //         //     res.redirect(req.query[REDIRECT_URI_PARAM_NAME]);
            //         // }
            //         // else {
            //             res.json({message: 'Successful update of access and refresh tokens'});
            //         // }

            //     }
            // })

        // }
        // catch(err) {
        //     //в задании написано, что должен "возвращать статус"
        //     res.sendStatus(401);
        // }
        
    })


    /**
     * 
     * @param {Response} res 
     */
    const redirectToLogin = (res) => {
        res.redirect(LOGIN_PATH);
        //res.sendStatus(401);
    }

    /**
     * 
     * @param {Response} res 
     */
    const send401 = (res) => {
        res.status(401).json({message: 'Unauthenticated access is prohibited'});
    }


    let authorizationFailAction = redirectToLogin;


    const mustBeAuthenticated = (req, res, next) => {

        validateTokenPromise(req, ACCESS_TOKEN_NAME)
        .then(tokenPayload => {
            req.token = tokenPayload;

            //res.send(`RESOURCE:<br />${payload.username}`);
            next();
        })
        .catch(err => {
            //здесь может быть и ошибка на стороне redis, но всё равно лучше перенаправить/ответить 401, так как аутентификацию проверить не удалось
            console.error(err);
            authorizationFailAction(res);
        })

        // validateToken(req, ACCESS_TOKEN_NAME, (err, tokenPayload) => {
        //     if (err) {
        //         //здесь может быть и ошибка на стороне redis, но всё равно лучше перенаправить/ответить 401, так как аутентификацию проверить не удалось
        //         console.error(err);
        //         authorizationFailAction(res);
        //     }
        //     else {
                
        //         req.token = tokenPayload;

        //         //res.send(`RESOURCE:<br />${payload.username}`);
        //         next();
                
        //     }
        // })
    
    }


    app.get(RESOURCE_PATH, mustBeAuthenticated, (req, res, next) => {

        let payload = req.token;


        const createcommitForm = '';
        // `
        // <form action="http://localhost:3000/api/repos/1/commits" method="post">
        //     <input type="text" name="message" />
        //     <input type="submit" value="submit" />
        // </form>
        // `;

        const logoutLink = `<a href="/logout">Logout</a>`;

        //TODO: добавил роль (role)
        res.send(`RESOURCE:<br />${logoutLink}<br />${JSON.stringify({id: payload.id, username: payload.username, role: payload.role})}<br />${createcommitForm}`);
    })


    //сюда всё равно не крепится refresh-token (по заданию), а крепить по арзным путям (не в пределах 1 иерархии) нельзя с помощью Path
    //это можно использовать для того, чтобы потом показать '/refresh-token' и получение, использование нового access_token
    app.get('/logout', mustBeAuthenticated, (req, res, next) => {

        const accessToken = req.signedCookies[ACCESS_TOKEN_NAME];

        const oldPayload = jwt.verify(accessToken, secretKey);

        //date.now() возвращает в ms
        const ttl = (oldPayload.exp - Date.now() / 1000 < 0)? 1: Math.round(oldPayload.exp - Date.now()/1000);
        //внутри ещё и удаляет cookie
        addTokenFromCookieToBlackList(req, res, ACCESS_TOKEN_NAME, ttl);

        //redisClient.sadd('tokens', accessToken, redis.print);

        // clearCookieByName(ACCESS_TOKEN_NAME);
        // clearCookieByName(REFRESH_TOKEN_NAME);

        res.redirect(LOGIN_PATH);
    })


    

    redisClient.on('connect', () => {

        console.log(`Connected to redis: ${redisClient.connected}`);

        // app.listen(PORT, () => {
        //     console.log(`Server is listening on ${PORT} port`);
        // })

    })


    redisClient.on('error', (err) => {
        console.dir(err);
    })

}
