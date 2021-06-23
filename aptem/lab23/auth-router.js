const express = require('express');

const authRouter = express.Router();

const PROVIDER_NAME = 'spotify';

const passport = require('passport');

const scopes = ['user-read-recently-played', 'user-read-currently-playing', 'user-read-playback-state', 'user-modify-playback-state'];


/**
 * 
 * @param {Request} req 
 * @param {*} res 
 * @param {*} next 
 */
const authenticationRedirect = (req, res, next) => {

    //когда ставил для /callback данный middleware как замену для passport.authenticate, то он захоидл сюда вмсте с code=... в uri,
    //затем он никогда не был аутентифицирован. В результате всегда было перенаправление на '/login'
    //поменял порядок для middleware'ов, чтобы он сначала производил аутнтифицацию
    let redirectPath = '/login';

    if (req.isAuthenticated()) {
        redirectPath = '/resource';
    }
    
    res.redirect(redirectPath);

    //next();
}


//этот бред создал только для тогО, чтобы хотя бы чистый запрос без параметров перекидывало, а не подставляло
const checkIfCodeParameterIsPresented = (req, res, next) => {
    //если не ограничиваю такой проверкой, то он сам зайдёт в стратегию и будет искать пользователя
    //выглядит это примерно так:
    // /auth/spotify/callback
    // /auth/spotify/callback?code=AQBYjgrQk6Fd-OmWqfTW9nvxnzv30chCiWImkpVyBBi7NSz9HOMNdGPY0wkkoTO_j0MSyrmw8VCmQg9eHm0pePWhX8Eao-lUVMM-lojWmB4sUh4BagCFa01tfprh3UPf8CiHPn3icwp32Jai9rYnMkm_wPORahmXBI3G5MiQ8dCKO9UrH634OJjYQKFuPnI
    if (req.query['code']) {
        next();
    }
    else {
        res.redirect('/login');
    }
}


//TODO: не работает перенаправление с callback на нужные мне url (failure) (когда нет passport.authenticate на callback, то не рботает, так как не будет залогинен)

const SpotifyAuthStrategy = require('passport-spotify');

/**
 * 
 * @param {SpotifyAuthStrategy} strategy 
 */
module.exports = (strategy) => {

    const authenticateByStrategy = passport.authenticate(strategy, {
        /*session:true,*/
        //этих двоих улчше не задавать в данном случае
        // failureRedirect: '/login',
        // successRedirect: '/resource',
        scope: scopes,
        //специально поставил, чтобы всегда выводилось и было нагляднее (да и в задании было написанО, чтобы перенаправляло при переходе на ссылку)
        //show_dialog	Optional.
        //Whether or not to force the user to approve the app again if they’ve already done so.
        //If false (default), a user who has already approved the application may be automatically redirected to the URI specified by redirect_uri.
        //If true, the user will not be automatically redirected and will have to approve the app again.
        showDialog: true
    });


    //когда уже залогинен, то он перенаправляет по похожему uri
    ///spotify/callback?code=AQBaK4UaJWjPQ7sZ-JnN-yzkCFOoDASpT55Xri8kgSnGpe9IfFtNQkKVK6f2L_GWuyycGwQRDy38ZGafqEJE_E1qmp8ikcLsYSKCn3zc6_Wl5rHABKiNwN3O-_MOX5mmVcd6emwy5bx7f3Ux8UkevElu2GFEE1kc6U_70__wZYppjwJ_5lJPLFNp7dpPuY2L7tWzOaok3oRaWX2u1astrw6MEms-ZqOPfnSjZ4xsgoCdxP0UCXZeCguY48L1TFOK2717mugCoHjZzAzFFLzOQIQbYtRWQK0cAzfrVDp0TzdWbNBceD4htRWnrMKGf4hfrqALEc9lzQkqAXUxHg
    //когда убирал нормальный passport.authenticate и ставил вмето него снаружи как middleware своё, то оно нормально не отрабатывало
    // authRouter.get(`/${PROVIDER_NAME}/callback`, /*passport.authenticate(strategy),*/ authenticationRedirect,   (req, res, next) => {
    //     res.send(req.url);
    // })

    //если не передаётся code в querystring, то тогда вообще никакого смысла пытаться продолжить нет
    //если будет, то можно попытаться authenticate

    //менять почти не пришлось, так как в документации к пакету почти всё то же самое, но и failure бесполезен
    //https://github.com/JMPerez/passport-spotify
    authRouter.get(
        `/${PROVIDER_NAME}/callback`,
        //бред, так как просто не пропустит, если нет параметра (может быть любой)
        checkIfCodeParameterIsPresented,
        //не перенаправляет нормально туда, куда нужно (если убрать middleware выше, то будет перекидывать не на то, что указал в failureRedirect, а на Spotify login)
        passport.authenticate(strategy, {
            successRedirect: '/resource',
            failureRedirect: '/random-address-that-are-not-used-for-redirections',
            //сюда точно не стоит добавлять showDialog, так как надо автоматическое перенаправление
            showDialog: false
        })
    );


    //когда запрашивало доступ. то можно было увидеть перечисление того, что быол указано в scope
    authRouter.get(`/${PROVIDER_NAME}`, authenticateByStrategy, (req, res, next) => {
        res.send(req.url);
    })
    

    //это совсем тупо выглядит, но по-другому не понятно, как нормально сделтаь redirect без создания подобных конструкций
    //в official руководстве по пакету тоже не преенаправляет нормально
    authRouter.use((err, req, res, next) => {
        console.error(err.message);
        
        //1 раз была другая ошибка: cannot fetch user data
        if (err.name == 'TokenError') {
            res.redirect('/login');
        }
        else {
            res.json(err);
        }
    })
    

    return authRouter;

}