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


app.use((req,res,next)=>{
    res.sendStatus(404);
})



const server = app.listen(process.env.PORT || 3000);