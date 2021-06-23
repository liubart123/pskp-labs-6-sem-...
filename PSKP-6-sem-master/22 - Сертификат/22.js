let app = require('express')();
let https = require('https');
let http = require('http');
let fs = require('fs');


let options = {
    key: fs.readFileSync('LAB.key').toString(),
    cert: fs.readFileSync('LAB.crt').toString()
};

https.createServer(options, app)
.listen(3000, ()=>{console.log('listening')});


app.use((req, res, next)=>{
    console.log('middleware 1');
    next();
});

app.get('/', (req, res, next)=>{
    console.log('middleware 2');
    res.end('hello from https');
})

/*
let options = {
    key: fs.readFileSync('LAB.key'),
    cert: fs.readFileSync('LAB.crt')
};

https.createServer(options, (req, res)=>{

    console.log('hello from https');
    res.end('hello from https');
    
}).listen(3000);
*/

//C:\Windows\System32\drivers\etc