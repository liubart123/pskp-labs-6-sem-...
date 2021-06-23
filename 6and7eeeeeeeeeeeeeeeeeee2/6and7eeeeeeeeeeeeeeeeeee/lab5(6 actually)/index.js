const express = require('express')
const app = express();
const passport = require('passport')
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


const localStorage = require('passport-local').Strategy



app.use(express.urlencoded());
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
const credentiales = require('./credentials')

{
passport.serializeUser((user, done) => {
    console.log('serialize', user);
    done(null, user);
});
passport.deserializeUser((user, done) => {
    console.log('deserialize', user);
    done(null, user);
});



passport.use(
    new localStorage({session:true},(username, password, done) => {
        console.log('passport.use ', username, password);
        let rc = null;
        let cr = credentiales.getCreadential(username);
        if (!cr) rc = done(null,false,{message:'invalid username'});
        else if (!credentiales.verifyPass(cr.password,password)) rc = done(null,false,{message:'incorrect password'});
        else rc = done(null,username);
        return rc;
}))


app.get('/login',(req,res)=>{
    res.sendFile(__dirname + '/login.html');
})
app.post('/login',
    (req, res, next) => {
    passport.authenticate('local', 
    (err,user,info)=>{
        // if (err){
        //     return next(err);
        // }
        if (!user || err) {
            return res.redirect('/login?info=' + info.message);
        }
        req.session.user=user;
        return res.redirect('/resource');
    })(req, res, next)
// {
//     failureRedirect: '/login',
//     successRedirect: '/resource'
// }
    
});

app.get('/logout',(req,res)=>{
    req.session.destroy();
    // req.logout();
    res.redirect('/login');
})
app.get('/resource',
    // passport.authenticate('local', {
    //     failureRedirect: '/login'
    // }),
(req,res,next)=>{
    if (!req.session.user)
        res.redirect('/login');
    else
        next()
},
(req,res)=>{
    res.send('re$ouce');
})
}




app.use((req,res,next)=>{
    res.sendStatus(404);
})



const server = app.listen(process.env.PORT || 3000);