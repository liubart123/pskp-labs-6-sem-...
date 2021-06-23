
const express = require('express');

const app = express();

const passport = require('passport');
const SpotifyAuthStrategy = require('passport-spotify').Strategy;


const fs = require('fs');
const path = require('path');

//https://developer.spotify.com/documentation/general/guides/authorization-guide/

//получил после создания application
//https://developer.spotify.com/dashboard/applications/2df97dab2273438dbb3cf5ff7b28e10e


//там было edit settings, в нём настроил redirect uris


const strategy = new SpotifyAuthStrategy({
    clientID: '2df97dab2273438dbb3cf5ff7b28e10e',
    clientSecret: '548a1eaddb2b4c50865d5c401f458d13',
    callbackURL: 'http://localhost:3000/auth/spotify/callback'
}, 
    //они напутали порядок параметров (если навести на параметр, то будет не тот тип данных выводить, а аткже не работало, когда записал преедачу параметров в том прядке, в котором они должны были быть (если судить по документации к пакету))
    //(accessToken, refreshToken, profile, done, expiresIn) => {
    (accessToken, refreshToken, expiresIn, profile, done) => {
        console.log(done);
        console.log(expiresIn);
        done(null, {
            profile: profile,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
)

passport.use('spotify', strategy);


//TODO: сессии используются по умолчанию: появлялась следующая ошибка в callback'е из strategy
//Error: Failed to serialize user into session



//https://www.npmjs.com/package/connect-redis


//Note Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work.
//This module now directly reads and writes cookies on req/res. Using cookie-parser may result in issues if the secret is not the same between this module and cookie-parser.
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
        prefix: 'session-oauth:',
        //так как добавил в cookie сессии maxAge, то будет уничтожать объекты, хранящие сессию после указанного в maxAge времени
        //If the session cookie has a expires date, connect-redis will use it as the TTL.
        //ttl: 
    })
}));


//когда было до app.use(expressSession), то была пробелма в том, что никогда не вызывался deserializeUser:
//https://stackoverflow.com/questions/11277779/passportjs-deserializeuser-never-called
app.use(passport.initialize());
app.use(passport.session());


//сюда попыдаю после того, как из стратегии возвращаю после успешного выполнения объект пользователя
//когда забыл определить данный метод: Error: Failed to serialize user into session
passport.serializeUser((user, done) => {
    done(null, user);
});
   
passport.deserializeUser((user, done) => {
    done(null, user);
});


//TODO: исопльозвал бы VK, но с документацией там не всё так весело

//https://vk.com/apps?act=manage



//https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app

//https://developer.spotify.com/dashboard/applications


app.use((req, res, next) => {
    console.log(req.url);
    next();
})


const CURRENTLY_PATH = '/currently';
const RECENTLY_PATH = '/recently';
const PAUSE_PATH = '/pause';




const redirectIfAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/resource');
    }
    else {
        next();
    }
}

const BUTTON_FILE_PATH = path.join(__dirname, 'button.html');

app.get('/login', redirectIfAuthenticated, (req, res, next) => {

    fs.access(BUTTON_FILE_PATH, fs.constants.R_OK, () => {
        fs.createReadStream(BUTTON_FILE_PATH).pipe(res);
    })
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


const authRouter = require('./auth-router')(strategy);

app.use('/auth', authRouter);


const mustBeAuthenticated = (req, res, next) => {

    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.redirect('/login');
    }
}


app.get('/logout', mustBeAuthenticated, (req, res, next) => {

    if (req.isAuthenticated()) {
        req.session.destroy();
    }
    
    res.redirect('/login');
})



app.get('/resource', mustBeAuthenticated, (req, res, next) => {

    const user = req.user;

    const userInfoJSON = JSON.stringify(user, null, '    ');

    const formattedUserInfo = userInfoJSON;

    const CURRENTLY_LINK = `<a href="${CURRENTLY_PATH}">Currently played</a>`;
    const RECENTLY_LINK = `<a href="${RECENTLY_PATH}">Recently played</a>`;
    const PAUSE_LINK = `<a href="${PAUSE_PATH}">Pause currently played</a>`;

    res.send(`<pre>RESOURCE:<br />${CURRENTLY_LINK}<br />${RECENTLY_LINK}<br />${PAUSE_LINK}<br />${formattedUserInfo}<pre />`);
})

const request = require('https').request;


//https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-recently-played

app.use(RECENTLY_PATH, mustBeAuthenticated, (req, res, next) => {

    //после того, как сессия отвалилась из redis (expired) была такая ошибка:
    //TypeError: Cannot destructure property 'accessToken' of 'req.user' as it is undefined.
    const {accessToken} = req.user;

    //TODO: добавил в ненормальном виде query-параметр
    let requestForRecentlyPlayed = request(`https://api.spotify.com/v1/me/player/recently-played?limit=50`, {
        method: 'GET'
        
    }, (response) => {

        let responseBody = '';

        response.on('data', (data) => {
            responseBody += data;
        })

        response.on('end', () => {

            const responseBodyObject = JSON.parse(responseBody);

            const responseForReturn = responseBodyObject.items.map(item => {

                let obj = {};

                obj.albumName = item.track.album.name;

                obj.artists = item.track.artists.map(artist=>{
                    return artist.name;
                });

                obj.trackName = item.track.name;

                obj.playedAt = item.played_at;

                return obj;

            })

            console.log(`Length: ${responseForReturn.length}`);

            res.send(`<pre>${JSON.stringify({
                statusCode: response.statusCode,
                resultsAmount: responseForReturn.length,
                body: responseForReturn
            }, null, '    ')}</pre>`)
        })

        response.on('error', (err) => {
            console.dir(err);

            res.send(err.message);
        })

    })

    requestForRecentlyPlayed.setHeader('Authorization', `Bearer ${accessToken}`);

    requestForRecentlyPlayed.end();
})


//https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-the-users-currently-playing-track

app.get(CURRENTLY_PATH, mustBeAuthenticated, (req, res, next) => {

    const {accessToken} = req.user;

    let requestForRecentlyPlayed = request(`https://api.spotify.com/v1/me/player/currently-playing`, {
        method: 'GET'
        
    }, (response) => {

        if (response.statusCode != 204) {

            let responseBody = '';

            response.on('data', (data) => {
                responseBody += data;
            })

            response.on('end', () => {

                const responseBodyObject = JSON.parse(responseBody);

                const item = responseBodyObject.item;

                let obj = {};

                obj.albumName = item.album.name;

                obj.artists = item.artists.map(artist=>{
                    return artist.name;
                });

                obj.trackName = item.name;

                let objJSON = JSON.stringify({
                    statusCode: response.statusCode,
                    body: obj
                }, null, '    ');

                //всегда есть несколько версий
                const image = `<img src="${item.album.images[1].url}" />`;

                const audioPreview = `<audio src=${item.preview_url} controls />`;

                res.send(`<pre>${objJSON}<br />${image}<br />${audioPreview}</pre>`);
            })

        }
        else {

            let objJSON = JSON.stringify({
                statusCode: response.statusCode,
                body: 'You are listening nothing right now'
            }, null, '    ');

            res.send(`<pre>${objJSON}</pre>`);
        }

        response.on('error', (err) => {
            console.dir(err);

            res.send(err.message);
        })
        

    })

    requestForRecentlyPlayed.setHeader('Authorization', `Bearer ${accessToken}`);

    requestForRecentlyPlayed.end();
})


//https://developer.spotify.com/documentation/web-api/reference/#endpoint-pause-a-users-playback

app.get(PAUSE_PATH, mustBeAuthenticated, (req, res, next) => {

    const {accessToken} = req.user;

    let requestForRecentlyPlayed = request('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT'
        
    }, (response) => {

        let responseBody = '';

        response.on('data', (data) => {
            responseBody += data;
        })

        response.on('end', () => {

            //на самом деле на данный запрос всегда при успехе будет 204 NO CONTENT. Разве что ошибки
            const responseBodyObject = '';

            if (responseBody != '') {
                responseBodyObject = JSON.parse(responseBody);
            }

            res.send(`<pre>${JSON.stringify({
                statusCode: response.statusCode,
                body: responseBodyObject
            })}</pre>`)
        })

        response.on('error', (err) => {
            console.dir(err);

            res.send(err.message);
        })

        
    })

    requestForRecentlyPlayed.setHeader('Authorization', `Bearer ${accessToken}`);

    requestForRecentlyPlayed.end();
})


app.use((req, res, next) => {
    res.sendStatus(404);
})

app.use((err, req, res, next) => {
    console.dir(err);

    res.status(500).send(err.message);
})

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} port`);
})