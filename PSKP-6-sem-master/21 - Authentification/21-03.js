const app = require('express')();
const express=require('express');
const users=require('./user.json');
const fs = require('fs');
const cp=require('cookie-parser');

function VerifyUser(user)
{
    c=false;
    users.forEach(element => {
        console.log(element.user);
        console.log(user);
        if(element.user==user)
        {
            c=true;
        }
    });
    return c;
}
function VerifyPassword(pass)
{
    let c=false;
    users.forEach(element => {
        console.log(element.password);
        console.log(pass);
        console.log(element.password==pass);
        if(element.password==pass)
        {
            c=true;
        }
    });
    return c;
}
app.use(cp());
app.use(express.urlencoded({extended:true}));

app.get('/login',(req,res,next)=>
{
    console.log('/login');
    const rs = fs.ReadStream('./21-01.html');
    rs.pipe(res);

}).post('/login',(req,res,next)=>
{
    console.log('params ',req.body);
    if(!VerifyUser(req.body.Login))
    {
        res.send('invalid username');
    }
    else if(!VerifyPassword(req.body.Password))
    {
        res.send('invalid password');
    }
    else
    {
        res.cookie('token','xxx-yyy-zzz').redirect('/resource');
    }
});

app.get('/resource',(req,res,next)=>
{
    if(req.cookies.token && req.cookies)
    {
        if(req.cookies.token=='xxx-yyy-zzz') res.send('resource');
        else res.redirect('/login');
    }
    else res.redirect('/login');
});

app.get('/logout',(req,res,next)=>
{
    res.cookie('token','')
    res.redirect('/login');
});

app.listen(3000,()=>
{
    console.log('Start server, port:3000');
});