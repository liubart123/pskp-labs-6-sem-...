const redis=require('redis');
const client=redis.createClient('//redis-12895.c90.us-east-1-3.ec2.cloud.redislabs.com:12895',
                                {password:'bAXlDNyISZyPBuBwUZKqd4cLManGJo7d'});
client.on('ready',()=>{console.log('ready')});
client.on('error',(err)=>{console.log('error '+err)});
client.on('connect',()=>{console.log('connect')});
client.on('end',()=>{console.log('end')});
client.quit();


//тестир соедин с сервером БД Redis