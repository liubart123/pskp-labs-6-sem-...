let app = require('express')();
let https=require('https');
let fs = require('fs');

let options={
    key:fs.readFileSync('LAB.key').toString(),
    crt:fs.readFileSync('LAB.crt').toString(),
}

// https.createServer(options,app).listen(3443);
var server = https.createServer({
    key: options.key,
    cert: options.crt,
    //ca: certificateAuthority,
    ciphers: [
        "ECDHE-RSA-AES128-SHA256",
        "DHE-RSA-AES128-SHA256",
        "AES128-GCM-SHA256",
        "RC4",
        "HIGH",
        "!MD5",
        "!aNULL"
    ].join(':'),
}, app).listen(3443);

app.get('/',(req,res)=>{
    res.send('hallo from https, parni....'); 
})