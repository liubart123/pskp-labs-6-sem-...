//исслед скорость вып 10000 запросов hset, hget

const redis=require('redis');
const client=redis.createClient('//redis-12895.c90.us-east-1-3.ec2.cloud.redislabs.com:12895',
{password:'bAXlDNyISZyPBuBwUZKqd4cLManGJo7d'});
client.on('ready',()=>{console.log('ready')});
client.on('error',(err)=>{console.log('error '+err)});
client.on('connect',()=>{console.log('connect')});
client.on('end',()=>{console.log('end')});


var now;
client.hset('incr', 0, JSON.stringify({id:0,val:'val-0'}),()=>{now =new Date();});
for (let n = 1; n < 9999; n++) { 
    client.hset('incr', n, JSON.stringify({id:n,val:'val-'+n}));
}
client.hset('incr',9999,JSON.stringify({id:9999,val:'val-9999'}),()=>{console.log('Time hset: '+(new Date()-now));});

//-------------------------------------------------

var getnow;
client.hget('incr',0,(err,result)=>{
    getnow =new Date();
    console.log(result);
})
for (let n = 1; n < 9999; n++) { 
    client.hget('incr',n);
}
client.hget('incr',9999,()=>{console.log('Time hget: '+(new Date()-getnow));})



client.quit();