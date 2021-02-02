const redis = require("redis")
const client = redis.createClient(
    '//redis-13725.c226.eu-west-1-3.ec2.cloud.redislabs.com:13725',
    {password:'ZAQwsxcderfv123'}
)

// client.on('ready',()=>{console.log('client ready');})
client.on('error',(err)=>{console.log(`client error: ${err}`);})
// client.on('connect',()=>{console.log('client connect');})
// client.on('end',()=>{console.log('client end :[');})
client.on('message',(channel,mes)=>console.log(`channel: ${channel}. Message: ${mes}`))
client.on('subscribe',(channel,count)=>console.log(`channel: ${channel}. count: ${count}`))


client.subscribe('NTV');


setTimeout(()=>{
    client.quit();},
    60000)