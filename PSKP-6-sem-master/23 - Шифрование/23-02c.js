const crypto = require('crypto');
const http =require('http');
const fs=require('fs');
const {ServerSign,ClientVerify} = require('./23-02m');

let options3= {
    host: 'localhost',
    path: '/resource',
    port: 8000,
    method:'GET'
}
let options= {
    host: 'localhost',
    path: '/',
    port: 8000,
    method:'GET',
    headers: {'content-type':'application/json'}
}

// GET /resource
const req3 = http.request(options3,(res)=> {

    const file = fs.createWriteStream('./txt/out2.txt');
    res.pipe(file);
    
    // GET /
    const req = http.request(options,(res)=> {
        let data = '';
        res.on('data',(chunk) => {data+=chunk.toString('utf-8');});
        res.on('end',()=>
        { 
            let signcontext = JSON.parse(data);
            var x = new ClientVerify(signcontext);
            const rs=fs.createReadStream('./txt/out2.txt');
            x.verify(rs,(result)=>
            {
                console.log('result:',result);
            })
        });
    });
    req.on('error', (e)=> {console.log('http.request: error:', e.message);});
    req.end();
});
req3.on('error', (e)=> {console.log('http.request: error:', e.message);});
req3.end();