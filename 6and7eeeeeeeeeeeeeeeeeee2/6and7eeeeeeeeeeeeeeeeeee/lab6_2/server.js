const express = require('express')
const app = express();
const Sequelize = require('sequelize')
// const sequelize = new Sequelize('LLH_pskp',
//     "student",
//     "Pa$$w0rd",
//     {
//         dialect: "mssql",
//         host: "win2008sql2008",
//         dialectOptions: {
//             options: {
//                 encrypt: false
//             }
//         },
//     });
const sequelize = new Sequelize('asp_dictionary',
    "pskp_user",
    "ZAQwsxcderfv123",
    {
        dialect: "mssql",
        host: "localhost"
    });
const models = require('./models');

sequelize.authenticate()
    .then(() => {
        console.log('db connection was created!');
        let asd = models.init(sequelize)
    })
    .catch(err => console.log(`connection error: ${err}`))


//REDIS-------------
const redis = require("redis")
const redisClient = redis.createClient(
    '//redis-13725.c226.eu-west-1-3.ec2.cloud.redislabs.com:13725',
    { password: 'ZAQwsxcderfv123' }
)
const redisJwtPrefix = "jt";
 
//JWT----------------------
const fs = require('fs');
const jwt = require('jsonwebtoken');

//http://travistidwell.com/jsencrypt/demo/ generating rsa keys
var privateKEY = fs.readFileSync('./private.key', 'utf8');
var publicKEY = fs.readFileSync('./public.key', 'utf8');
//secret key stored in auth Server, while public key is used to verify token for valid by anyone 


var signOptions = {
    expiresIn: "10m",   //Expiration time after which the token will be invalid.
    algorithm: "RS256"
};
var verifyOptions = {
    expiresIn: "10m",
    algorithm: ["RS256"]
};
var signRtOptions = {
    expiresIn: "1d",   //Expiration time after which the token will be invalid.
    algorithm: "RS256"
};
var verifyRtOptions = {
    expiresIn: "1d",
    algorithm: ["RS256"]
};

//ROUTES------------
// app.use(require('body-parser').json())
const formidableMiddleware = require('express-formidable');
const { Server } = require('http');
app.use(formidableMiddleware());

cookieParser = require('cookie-parser')
app.use(cookieParser('secret key'))


app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
})
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
})


app.get('/logout', (req, res) => {

    let token;
    if (req.signedCookies.token)
        token = req.signedCookies.token;
    if (token) {
        res.clearCookie("rtToken");
        let legit = jwt.verify(token, publicKEY, verifyOptions,
            (err, payload) => {
                if (err) {
                    res.status(403).send(err.message);
                    return
                } else {
                    const ttl = (payload.exp - Date.now() / 1000 < 0) ? 1 : Math.round(payload.exp - Date.now() / 1000);
                    redisClient.set(redisJwtPrefix + token, '', 'EX', ttl);

                    let rtToken;
                    if (req.signedCookies.rtToken)
                        rtToken = req.signedCookies.rtToken;
                    if (rtToken){
                        let legit = jwt.verify(rtToken, publicKEY, verifyRtOptions,
                            (err, payload2) => {
                                if (!err){
                                    const ttl2 = Math.round(payload2.exp - Date.now() / 1000);
                                    redisClient.set(redisJwtPrefix + rtToken, '', 'EX', ttl2);
                                }
                            })
                    }
                }
            })

    }
    res.cookie(
        "token",
        "",
        {
            maxAge: 0,
            path: '/',
            signed: true,
            httpOnly: true,
            sameSite: 'strict'
        }
    )
    res.clearCookie("rtToken");
    res.send('logouted');
})


app.post('/auth', (req, res) => {
    if (!req.fields.name || !req.fields.password)
        return res.sendStatus(400);
    models.User.findOne({
        where: {
            name: req.fields.name,
            password: req.fields.password,
        }
    })
        .then(dbRes => {
            if (!dbRes)
                return res.status(403).send("no such user");
            let token = jwt.sign({ user_id: dbRes.dataValues.id }, privateKEY, signOptions)
            let rtToken = jwt.sign({ user_id: dbRes.dataValues.id }, privateKEY, signRtOptions)
            res.cookie(
                "token",
                token,
                {
                    maxAge: 10 * 60 * 1000,
                    path: '/',
                    signed: true,
                    httpOnly: true,
                    sameSite: 'strict'
                }
            )
            res.cookie(
                "rtToken",
                rtToken,
                {
                    maxAge: 24 * 60 * 60 * 1000,
                    path: '/',
                    signed: true,
                    httpOnly: true,
                    sameSite: 'strict'
                }
            )
            return res.status(200).json({
                token: token
            });
        })
        .catch(err => {
            return res.status(403).send("error");
        })
})

app.use((req,res,next)=>{
    let token;
    if (req.headers.authorization)
        token = req.headers.authorization.split(' ')[1];
    else if (req.signedCookies.token)
        token = req.signedCookies.token;
    if (token){
        let legit = jwt.verify(token, publicKEY, verifyOptions,
            (err,payload)=>{
                if (err){
                    res.status(401).send(err.message);
                    return
                } else {
                    redisClient.exists(redisJwtPrefix + token, (err, exist) => {
                        if (err){
                            res.status(500).send(JSON.stringify(err));
                        }
                        if (exist){
                            res.status(403).send("black listed");
                        } else {
                            req.user = payload;
                            next();
                        }
                    })
                }
            })

    } else {
        next();
    }
})


app.post('/register', (req, res) => {
    if (!req.fields.name || !req.fields.password)
        return res.sendStatus(400);
    models.User.findOne({
        where: {
            name: req.fields.name,
            password: req.fields.password,
        }
    })
        .then(dbRes => {
            if (dbRes)
                return res.status(400).send("such user");
            
            models.User.create({
                name:req.fields.name,
                password:req.fields.password
            })
                .then(dbRes=>{
                    return res.status(200).json({
                        token: JSON.stringify(dbRes)
                    });
                })
                .catch(err => {
                    return res.status(403).send("error");
                })
        })
        .catch(err => {
            return res.status(403).send("error");
        })
})

app.get('/resource',(req,res)=>{
    if (!req.user)
        return res.sendStatus(401);
    return res.send('re#ource for ' + JSON.stringify(req.user));
})


app.get('/refresh',(req,res)=>{

    let token;
    if (req.signedCookies.rtToken)
        token = req.signedCookies.rtToken;
    let atoken;
    if (req.signedCookies.token)
        atoken = req.signedCookies.token;
    if (token) {
        res.clearCookie("rtToken");
        let legit = jwt.verify(token, publicKEY, verifyRtOptions,
            (err, payload) => {
                if (err) {
                    res.status(401).send(err.message);
                    return
                } else {
                    redisClient.exists(redisJwtPrefix+token,(err,exist)=>{
                        if (err)
                            res.status(500).send(err);
                        if (exist) {
                            res.status(403).send("black listed");
                        } else {
                            const ttl = (payload.exp - Date.now() / 1000 < 0) ? 1 : Math.round(payload.exp - Date.now() / 1000);
                            redisClient.set(redisJwtPrefix + token, '', 'EX', ttl);

                            let newToken = jwt.sign({ id: payload.user_id}, privateKEY, signOptions)
                            let rtToken = jwt.sign({ id: payload.user_id }, privateKEY, signRtOptions)
                            res.cookie(
                                "token",
                                newToken,
                                {
                                    maxAge: 10 * 60 * 1000,
                                    path: '/',
                                    signed: true,
                                    httpOnly: true,
                                    sameSite: 'strict'
                                }
                            )
                            res.cookie(
                                "rtToken",
                                rtToken,
                                {
                                    maxAge: 24 * 60 * 60 * 1000,
                                    path: '/',
                                    signed: true,
                                    httpOnly: true,
                                    sameSite: 'strict'
                                }
                            )
                            if (atoken){
                                redisClient.exists(redisJwtPrefix+atoken,(err,exist)=>{
                                    if (err)
                                        res.status(500).send(err);
                                    if (exist) {
                                        redisClient.get(redisJwtPrefix+atoken,(err,result)=>{
                                            jwt.verify(atoken, publicKEY, verifyOptions,
                                                (err,apayload)=>{
                                                    if (err){
                                                        res.status(401).send(err.message);
                                                        return
                                                    } else {
                                                        const ttl = (apayload.exp - Date.now() / 1000 < 0) ? 1 : Math.round(apayload.exp - Date.now() / 1000);
                                                        redisClient.set(redisJwtPrefix + atoken, '', 'EX', ttl);
                                                        res.sendStatus(200); 
                                                    }
                                                })
                                        })
                                    } else {
                                        jwt.verify(atoken, publicKEY, verifyOptions,
                                            (err,apayload)=>{
                                                if (err){
                                                    res.status(401).send(err.message);
                                                    return
                                                } else {
                                                    redisClient.set(redisJwtPrefix + atoken, '', 'EX',  Math.round(apayload.exp - Date.now() / 1000));
                                                    res.sendStatus(200);
                                                }
                                            })
                                    }
                                })
                            }else {
                                res.sendStatus(200);
                            }
                        }
                    })
                }
            })

    } else {
        res.status(400).send('where rt token?');
    }
})

app.use((req, res, next) => {
    res.sendStatus(404);
})
app.listen(3000);