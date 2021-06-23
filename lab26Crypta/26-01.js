const crypto = require('crypto');
const {ServerDH,ClientDH} = require('./26m');
const fs=require('fs');
const express=require('express');
const http=require('http');
const app = express();
var serverDH;
serverDH = new ServerDH(1024,3);
var commonSecret;


app.use(express.urlencoded());
app.use(express.json());


app.get('/',(req,res,next)=>
{
    res.writeHead(200,{'Content-Type': 'application/json'});
	res.end(JSON.stringify(serverDH.getContext()));
});



app.post('/setKey',(req,res,next)=>
{
	if(req.body.key_hex)
	{
		commonSecret=serverDH.getSecret(req.body);
		res.writeHead(200,{'Content-Type': 'text/plain'});
		res.end('okk');
	}
	else
	{
		res.statusCode=409;
		res.end('need key');
	}
	
});


app.get('/resource',(req,res,next)=>
{
	if(commonSecret!=undefined)
	{
		res.statusCode=200;
		let rs=fs.createReadStream('./awesomeContent.txt');

        //openssl list -cipher-algorithms
        const piv = Buffer.alloc(16,0);
        var key=new Buffer(32);
        commonSecret.copy(key,0,0,32)
        let cypher = crypto.createCipheriv(
            'aes-256-cbc',
            key,
            piv
        )
        rs.pipe(cypher).pipe(res);
		rs.on('close',()=> {res.end();});
	}
	else
	{
		res.statusCode=409;
		res.end('need key');
	}
});

var server=app.listen(3000);