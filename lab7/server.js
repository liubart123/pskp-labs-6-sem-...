const express = require('express')
const app = express();
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session')(
    {
        resave: false,
        saveUninitialized: false,
        secret:'eeeeeeeeeeeeeeee',
    }
)
app.use(session);
app.use(passport.initialize());
app.use(passport.session());


passport.use(
    new GoogleStrategy({
        clientID:'887377464303-4vf7udj4di46543j8616a7psftfhmoek.apps.googleusercontent.com',
        clientSecret:'QWVoRvwrIyKfd2SV9-eyA37u',
        callbackURL : 'http://localhost:3000/ok'
    },
    (token,refreshToken,profile,done)=>{
        done(null,{profile:profile,token:token});
    })
)

passport.serializeUser((user,done)=>{
    console.log('serialize:displayName', user.profile.displayName);
    done(null,user);
})

passport.deserializeUser((user,done)=>{
    console.log('deserialize: displayName',user.profile.displayName);
    done(null,user);
})

app.get('/login',(req,res)=>{
    res.sendFile(__dirname + '/login.html')
})
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})


app.get('/auth/googel', passport.authenticate('google',{scope:['profile']}));

app.get('/ok',passport.authenticate('google',{failureRedirect:'/login'}),
    (req,res)=>{res.redirect('/resource');}
)

app.get('/resource',(req,res,next)=>{
    if (req.user) res.status(200).send('re$our#e ' + JSON.stringify(req.user));
    else res.redirect('/login');
})

app.use('/',(req,res,next)=>{
    res.sendStatus(404);
})


app.listen(3000);