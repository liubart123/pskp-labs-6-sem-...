const crypto = require('crypto');
const http =require('http');
const query= require('querystring');
const {ServerDH,ClientDH} = require('./26m');
const fs=require('fs');
const axios = require('axios');
let parms;
var clientDH;

let getKey= {
    host: 'localhost',
    path: '/',
    port: 3000,
	method:'GET',
	headers: {'content-type':'application/json'}
}
let setKey= {
	host: 'localhost',
	path: '/setKey',
	port: 3000,
	method:'POST'
}
let getChiper= {
	host: 'localhost',
	path: '/resource',
	port: 3000,
	method:'GET'
}

axios.get('http://localhost:3000/').then(res=>{
    console.log(res.data);
    console.log(res.request.res.statusCode);
    let serverContext=res.data;
    clientDH= new ClientDH(res.data);
    console.log('send post...');
    axios.post('http://localhost:3000/setKey/', clientDH.getContext()).then(res2=>{
        if(res.request.res.statusCode!=409)
        {
            //GET (/resource)
            const req3 = http.request(getChiper,(res3)=>
            {
                if(res3.statusCode!=409)
                {
                    const ws=fs.createWriteStream('./awesomeContentDecoded.txt');
                    let commonSecret =clientDH.getSecret(serverContext);
                    var key=new Buffer(32);
                    commonSecret.copy(key,0,0,32)
                    // console.log('coomon secret: ' + commonSecret);
                    const piv = Buffer.alloc(16,0);
                    let cypher = crypto.createDecipheriv(
                        'aes-256-cbc',
                        key,
                        piv
                    )
                    res3.pipe(cypher).pipe(ws);
                    // res3.pipe(ws);
                }
            });
            req3.on('error', (e)=> {console.log('http.request: error:', e.message);});
            req3.end();
        }else {
            console.log("409 response");
        }
    }).catch(err=>{
        console.log('errrO: ' + err);
    })
}).catch(err=>{
    console.log('errrO: ' + err);
})

