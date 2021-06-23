const express = require('express')
const app = express();
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy
const DigestStrategy = require('passport-http').DigestStrategy
const session = require('express-session')(
    {
        resave:false,
        saveUninitialized:false,
        secret: '112', 
        cookie: {
            maxAge: 10 * 60 * 1000,
            httpOnly: false,
        },
    }
)

app.use(session);
app.use(passport.initialize());
app.use(passport.session());
const basicRouter = express.Router();
const credentiales = require('./credentials')
//basic
{


passport.use(new BasicStrategy((user, password, done) => {
    console.log('passport.use ', user, password);
    let rc = null;
    let cr = credentiales.getCreadential(user);
    if (!cr) rc = done(null,false,{message:'invalid username'});
    else if (!credentiales.verifyPass(cr.password,password)) rc = done(null,false,{message:'incorrect password'});
    else rc = done(null,user);
    return rc;
}))


passport.serializeUser((user, done) => {
    console.log('serialize', user);
    done(null, user);
});
passport.deserializeUser((user, done) => {
    console.log('deserialize', user);
    done(null, user);
});


basicRouter.get('/login', (req, res, next) => {
        console.log('preAuth');
        if (req.session.logout) {
            req.session.logout = false;
            delete req.headers['authorization'];
        }
        next();
    },  
    passport.authenticate('basic')
).get('/login', (req, res, next) => {
    if (req.headers['authorization']) {
        res.send('success login');
    }
    else {
        res.redirect('/basic/login');
    }

    //res.send('success login');
});
basicRouter.get('/logout',(req,res)=>{
    req.session.logout=true;
    res.redirect('/basic/login');
})
basicRouter.get('/resource',
    passport.authenticate('basic', {
        failureRedirect: '/basic/login'
    }),
(req,res,next)=>{
    if (req.session.logout == true)
        res.redirect('/basic/login');
    else
        next()
},
(req,res)=>{
    res.send('re$ouce');
})
}


const digestRouter = express.Router();
//digest
{
    passport.use(new DigestStrategy({qop:'auth'}, (user, done) => {
        // console.log('passport.use ', user, password);
        let rc = null;
        let cr = credentiales.getCreadential(user);
        if (!cr) rc = done(null, false, { message: 'invalid username' });
        //else if (!credentiales.verifyPass(cr.password, password)) rc = done(null, false, { message: 'incorrect password' });
        else rc = done(null, cr.name,cr.password);
        return rc;
    },(params,done)=>{
        console.log('params = ', params)
        done(null,true);
    }))


    app.get('/login', (req, res, next) => {
        console.log('preAuth');
        if (req.session.logout) {
            req.session.logout = false;
            delete req.headers['authorization'];
        }
        next();
    },
        passport.authenticate('digest', { session: false })
    ).get('/login', (req, res, next) => {
        if (req.headers['authorization']) {
            res.send('success login');
        }
        else {
            res.redirect('/login');
        }

        //res.send('success login');
    });
    app.get('/logout', (req, res) => {
        req.session.logout = true;
        res.redirect('/login');
    })
    app.get('/resource',
        passport.authenticate('digest', {
            failureRedirect: '/login',
            session: false
        }),
        (req, res, next) => {
            if (req.session.logout == true)
                res.redirect('/login');
            else
                next()
        },
        (req, res) => {
            res.send('re$ouce');
        })
}

app.use('/basic', basicRouter);
app.use('/digest', digestRouter);

app.use((req,res,next)=>{
    res.sendStatus(404);
})



const server = app.listen(process.env.PORT || 3000);