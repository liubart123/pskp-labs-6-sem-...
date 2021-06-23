const express = require('express');

const app = express();

const credentials = require('./credentials.json');

const passport = require('passport');

const passportLocal = require('passport-local');

const localStrategy = new passportLocal.Strategy({
    usernameField: 'username',
    passwordField: 'password',
    session: true
}, (username, password, done) => {

    let occurs = credentials.some(cred => {
        return cred.login == username && cred.password == password;
    })

    if (occurs) {
        done(null, {username, password});
    }
    else {
        done(null, false, {message: 'Cannot find user by provided credentials'});
    }

})


const STATIC_FOLDER_PATH = require('path').join(__dirname, '/static');

//в консоли много ошибок, так как пытается вытянуть для .css и .js файлов bootstrap ещё и соотвутствующие .map
app.use('/static', express.static(STATIC_FOLDER_PATH, {
    //до установки данног освйоства он не мог найти файл, поэтому переходил в next, в котором тоже кидалась ошибка и засорялись логи
    //теперь просто 404, если не найдёт файл
    //https://stackoverflow.com/questions/38709864/nodejs-express-dealing-with-missing-static-files
    fallthrough: false
}))


app.use(express.urlencoded({extended: false}));

//const bodyParser = require('body-parser');

// app.use(bodyParser.urlencoded({
//     extended: true
// }));


passport.use('local', localStrategy);





//https://www.npmjs.com/package/connect-redis



//Note Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work. This module now directly reads and writes cookies on req/res. Using cookie-parser may result in issues if the secret is not the same between this module and cookie-parser.
const expressSession = require('express-session');

let redisStore = require('connect-redis')(expressSession);


const redis = require('redis');

const redisConfig = require('./redis.json');

const redisClient = redis.createClient({
    host: redisConfig.host,
    //db: 'BSTU',
    port: redisConfig.port,
    password: redisConfig.password
});




app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'secret-key',
    name: 'sid',
    cookie: {
        //Session cookies are removed when the client shuts down. Cookies are session cookies if they don't specify the Expires or Max-Age attributes.
        maxAge: 1000*60*60,
        httpOnly: true,
        //Path=path-value Optional
        //A path that must exist in the requested URL, or the browser won't send the Cookie header.
        //path-value/The forward slash (/) character is interpreted as a directory separator, and subdirectories will be matched as well: for Path=/docs, /docs, /docs/Web/, and /docs/Web/HTTP will all match.
        //path: '*'
    },
    store: new redisStore({
        client: redisClient,
        prefix: 'session:',
        //так как добавил в cookie сессии maxAge, то будет уничтожать объекты, хранящие сессию после указанного в maxAge времени
        //If the session cookie has a expires date, connect-redis will use it as the TTL.
        //ttl: 
    })
}));



//когда было до app.use(expressSession), то была пробелма в том, чт оникогад не вызыввался deserializeUser:
//https://stackoverflow.com/questions/11277779/passportjs-deserializeuser-never-called
app.use(passport.initialize());
app.use(passport.session());




//сюда попыдаю после тогО ,как из стратегии возвращаю после успешного выполнения объект пользователя
//когда забыл определить данный метод: Error: Failed to serialize user into session
passport.serializeUser((user, done) => {
    done(null, user.username);
});
   
passport.deserializeUser((username, done) => {

    let foundUsersByUsername = credentials.filter((cred) => {
        return cred.login == username;
    })

    let foundUser = false;
    
    if (foundUsersByUsername.length != 0) {

        foundUser = {
            username: foundUsersByUsername[0].login,
            password: foundUsersByUsername[0].password
        }
    }

    done(null, foundUser);
});



//смысл использования сессий в данном пакете сводится к тому. тчо вместо тоГО .чт бы вызывать потсоняно метод для стратегии, будет совершаться deserialize, котоырйы будет доставать из сессии


const PORT = 3000;

const fs = require('fs');


app.use((req, res, next) => {
    console.log(`${req.method}: ${req.url}`);
    next();
})


app.get('/redis', (req, res, next) => {
    //менял префикс (сначала был 'sess:', а сделал 'session:')
    //когда вперые получил список ключей, то было 2 ключа:
    //["sess:BHxAn46IMCr8zzz-cMH6lCTvoioxs4N8","sess:ZOzP4kcum64aKkWNE7wz9su5AgVdDICK"]
    //по идее, они остались потому, что были использованы сеансовые сессии (без maxAge, поэтому ttl не устанавливался для redisStore)
    redisClient.keys("*sess*", (err, keys) => {
        
        if (err) {
            res.sendStatus(500);
        }
        else {
            res.status(200).json(keys);
        }
        
    })

    
})


const LOGIN_PATH = '/login';
const RESOURCE_PATH = '/resource';

const redirectToResourceIfAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect(RESOURCE_PATH);
    }
    else {
        next();
    }
}

app.get(LOGIN_PATH, redirectToResourceIfAuthenticated, (req, res, next) => {
    fs.createReadStream('./form.html').pipe(res);
})

const authenticate = passport.authenticate(localStrategy, {failureRedirect: LOGIN_PATH, successRedirect: RESOURCE_PATH, session: true});

app.post(LOGIN_PATH, authenticate
    
//     , (req, res, next) => {

//     // const {username, password} = req.body;

//     // req.session.username = username;

//     // req.session.save((err) => {

//     //     if (err) {
//     //         console.error(err);
//     //     }
        
//     // })

//     // console.log(req.body);
// }

)

app.get('/logout', (req, res, next) => {
    //хоть в cookie и оставалось, но isAuthorized будет отдавать false
    //при это также удаляется из хранилища объект сессии
    req.session.destroy();
    //req.logOut();
    //req.logOut();
    //в задании е было, но так понятнее будет, что произошло
    res.redirect(LOGIN_PATH);
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
    if (req.isAuthenticated()) {
        next();
    }
    else {
        //return res.redirect(LOGIN_PATH);
        //res.sendStatus(401);
        authorizationFailAction(res);
    }
}

app.get(RESOURCE_PATH, mustBeAuthenticated, (req, res, next) => {
    res.send(`RESOURCE:<br />${JSON.stringify(req.session.passport)}`);
})

app.use((req, res, next) => {
    res.sendStatus(404);
})

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    next();
})

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} port`);
})