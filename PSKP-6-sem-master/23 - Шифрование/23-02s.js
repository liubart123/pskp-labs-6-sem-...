const crypto = require('crypto');
const {ServerSign,ClientVerify} = require('./23-02m');
const fs=require('fs');
let rs2=fs.createReadStream('./txt/in.txt');
const app = require('express')();
app.set('port',8000);


app.get('/resource',(req,res,next)=>
{
	res.statusCode=200;
	rs2.pipe(res);
	rs2.on('close',()=>{console.log(rs2.bytesRead); res.end();});
});

app.get('/',(req,res,next)=>
{
	let ss= new ServerSign();	
	let rs=fs.createReadStream('./txt/in.txt');
    ss.getSignContext(rs,(signcontext)=>
    {
        res.writeHead(200,{'Content-Type': 'application/json'});
	    res.end(JSON.stringify(signcontext));
    });
});



app.listen(8000,()=>{console.log('Server is listening: 8000');});