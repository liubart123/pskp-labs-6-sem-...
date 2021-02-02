const redis = require("redis")
const client = redis.createClient(
    '//redis-13725.c226.eu-west-1-3.ec2.cloud.redislabs.com:13725',
    {password:'ZAQwsxcderfv123'}
)
// client.on('ready',()=>{console.log('client ready');})
client.on('error',(err)=>{console.log(`client error: ${err}`);})
// client.on('connect',()=>{console.log('client connect');})
// client.on('end',()=>{consol

var operSize = 10000;

setTest = (cb)=>{
    console.log('set test')
    console.time('setFull');
    console.time('setStart');
    console.time('immediate');
    console.time('0ms');
    let counter = 0
    setImmediate(()=>console.timeEnd('immediate'))
    setTimeout(()=>console.timeEnd('0ms'),0)
    for (let i = 0;i<operSize;i++){
        client.set(i,i.toString(),(res)=>{
            if(counter==0){
                console.time('set');
                console.timeEnd('setStart');
            }
            if (counter == operSize-1){
                console.timeEnd('set');
                console.timeEnd('setFull');
                if (cb !== undefined)
                    cb();
            }
            counter++;
        });
    }
    client.publish('NTV','end of set test')
}
getTest = (cb)=>{
    console.log('get test')
    console.time('getFull');
    console.time('getStart');
    console.time('getImmediate');
    let counter = 0
    setImmediate(()=>console.timeEnd('getImmediate'))
    for (let i = 0;i<operSize;i++){
        client.get(i,(res)=>{
            if(counter==0){
                console.time('get');
                console.timeEnd('getStart');
            }
            if (counter == operSize-1){
                console.timeEnd('get');
                console.timeEnd('getFull');
                if (cb !== undefined)
                    cb();
            }
            counter++;
        });
    }
    client.publish('NTV','end of get test')
}
delTest = (cb)=>{
    console.log('del test')
    console.time('delFull');
    console.time('delStart');
    console.time('delImmediate');
    let counter = 0
    setImmediate(()=>console.timeEnd('delImmediate'))
    for (let i = 0;i<operSize;i++){
        client.del(i,(res)=>{
            if(counter==0){
                console.time('del');
                console.timeEnd('delStart');
            }
            if (counter == operSize-1){
                console.timeEnd('del');
                console.timeEnd('delFull');
                if (cb !== undefined)
                    cb();
            }
            counter++;
        });
    }
    client.publish('NTV','end of del test')
}

hsetTest = (cb)=>{
    console.log('hset test')
    console.time('hsetFull');
    console.time('hsetStart');
    console.time('hset immediate');
    let counter = 0
    setImmediate(()=>console.timeEnd('hset immediate'))
    for (let i = 0;i<operSize;i++){
        client.hset(i.toString(),i.toString(),'val-'+i.toString(),(res)=>{
            if(counter==0){
                console.time('hset');
                console.timeEnd('hsetStart');
            }
            if (counter == operSize-1){
                console.timeEnd('hset');
                console.timeEnd('hsetFull');
                if (cb !== undefined)
                    cb();
            }
            counter++;
        });
    }
    client.publish('NTV','end of hset test')
}
hgetTest = (cb)=>{
    console.log('hget test')
    console.time('hgetFull');
    console.time('hgetStart');
    console.time('hget immediate');
    let counter = 0
    setImmediate(()=>console.timeEnd('hget immediate'))
    for (let i = 0;i<operSize;i++){
        client.hget(i.toString(),i.toString(),(res)=>{
            if(counter==0){
                console.time('hget');
                console.timeEnd('hgetStart');
            }
            if (counter == operSize-1){
                console.timeEnd('hget');
                console.timeEnd('hgetFull');
                if (cb !== undefined)
                    cb();
            }
            counter++;
        });
    }
}

incTest = (cb)=>{
    client.set('incr',0);
    console.log('inc test')
    console.time('inc Full');
    console.time('inc Start');
    console.time('inc immediate');
    let counter = 0
    setImmediate(()=>console.timeEnd('inc immediate'))
    for (let i = 0;i<operSize;i++){
        client.incr('incr',(res)=>{
            if(counter==0){
                console.time('inc');
                console.timeEnd('inc Start');
            }
            if (counter == operSize-1){
                console.timeEnd('inc');
                console.timeEnd('inc Full');
                if (cb !== undefined)
                    cb();
            }
            counter++;
        });
    }
}
decTest = (cb)=>{
    client.set('incr',0);
    console.log('dec test')
    console.time('dec Full');
    console.time('dec Start');
    console.time('dec immediate');
    let counter = 0
    setImmediate(()=>console.timeEnd('dec immediate'))
    for (let i = 0;i<operSize;i++){
        client.decr('incr',(res)=>{
            if(counter==0){
                console.time('dec');
                console.timeEnd('dec Start');
            }
            if (counter == operSize-1){
                console.timeEnd('dec');
                console.timeEnd('dec Full');
                if (cb !== undefined)
                    cb();
            }
            counter++;
        });
    }
}


setTest(
    ()=>getTest(
        ()=>delTest(
            ()=>hsetTest(
                ()=>hgetTest(
                    ()=>incTest(
                        ()=>decTest()
                    )
                )
            )
        )
    )
);

setTimeout(()=>{
    client.unsubscribe();
    client.quit();},
    60000)