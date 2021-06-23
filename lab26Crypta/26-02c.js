const crypto = require('crypto');
const http =require('http');
const fs=require('fs');
const {ServerSign,ClientVerify} = require('./26-02m');
const axios = require('axios');

let options3= {
    host: 'localhost',
    path: '/resource',
    port: 3000,
    method:'GET'
}


const req3 = http.request(options3,(res)=> {
    const file = fs.createWriteStream('./awesomeContentCheck.txt');
    res.pipe(file);
    
    axios.get('http://localhost:3000/').then(res=>{

        // console.log(res.data);

        var client = new ClientVerify(res.data);
        const rs=fs.createReadStream('./awesomeContentCheck.txt');
        client.verify(rs,(result)=>
        {
            console.log('virified:',result);
        })
    }).catch(err=>{
        console.log('errrO: ' + err);
    })

});
req3.on('error', (e)=> {console.log('error:', e.message);});
req3.end();