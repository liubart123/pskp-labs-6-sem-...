const crypto = require('crypto');
const http =require('http');
const query= require('querystring');
const {ServerDH,ClientDH} = require('./23-01m2');
const fs=require('fs');
const decipherFile = require('./23-01m').decipherFile;
let parms;
var clientDH;

let options= {
    host: 'localhost',
    path: '/',
    port: 8000,
	method:'GET',
	headers: {'content-type':'application/json'}
}
let options2= {
	host: 'localhost',
	path: '/setKey',
	port: 8000,
	method:'POST'
}
let options3= {
	host: 'localhost',
	path: '/resource',
	port: 8000,
	method:'GET'
}

// (GET /)
const req = http.request(options,(res)=>
{
	let data = '';
    res.on('data',(chunk) => {data+=chunk.toString('utf-8');});
    res.on('end',()=>{ 
		let serverContext = JSON.parse(data);
		clientDH= new ClientDH(serverContext);
		parms=JSON.stringify(clientDH.getContext());


		//POST (/setKey)
		const req2 = http.request(options2,(res)=>
		{
			if(res.statusCode!=409)
			{
				//GET (/resource)
				const req3 = http.request(options3,(res)=>
				{
					if(res.statusCode!=409)
					{
						const file=fs.createWriteStream('./txt/de.txt');
						var key=new Buffer(32);
						let clientSecret =clientDH.getSecret(serverContext);
						clientSecret.copy(key,0,0,32)
						decipherFile(res,file,key);
					}
				});
				req3.on('error', (e)=> {console.log('http.request: error:', e.message);});
				req3.end();
			}
		});
		req2.on('error', (e)=> {console.log('http.request: error:', e.message);});
		console.log(parms);
		req2.write(parms);
		req2.end();
    }); 
});
req.on('error', (e)=> {console.log('http.request: error:', e.message);});
req.end();

