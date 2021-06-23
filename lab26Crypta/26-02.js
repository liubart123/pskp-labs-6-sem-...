const crypto = require('crypto');
const {ServerSign,ClientVerify} = require('./26-02m');
const fs=require('fs');
let rs=fs.createReadStream('./awesomeContent.txt');
const app = require('express')();


app.get('/resource',(req,res,next)=>
{
	res.statusCode=200;
	rs.pipe(res);
	rs.on('close',()=>{ res.end();});
});

app.get('/',(req,res,next)=>
{
	let ss= new ServerSign();	
	let rs=fs.createReadStream('./awesomeContent.txt');
    ss.getSignContext(rs,(signcontext)=>
    {
        res.writeHead(200,{'Content-Type': 'application/json'});
        // console.log('sended: ' + JSON.stringify(signcontext));
	    res.end(JSON.stringify(signcontext));
    });
});



app.listen(3000);