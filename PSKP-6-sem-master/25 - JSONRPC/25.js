const JsonRPCSever = require('jsonrpc-server-http-nats');
const server = new JsonRPCSever();

let bin_validator = (param)=>{
    console.log('validation0', param);
    if(!Array.isArray(param))   throw new Error('ожидается массив');
    param.forEach(p=>{if(!isFinite(p))    throw new Error ('ожидается число')});
    return param;
}

let sumTo = (par)=>{
    var sum = 0;
    for(var i=0; i<par.length; i++){
        sum+=par[i];
    }
    return sum;
}

let mulTo = (par)=>{
    var mul = 1;
    for(var i=0; i<par.length; i++){
        mul*=par[i];
    }
    return mul;
}

server.on('div', bin_validator, (params, channel, resp) => {resp(null, params[0]/params[1]);});
server.on('proc', bin_validator, (params, channel, resp) => {resp(null, params[0]/params[1]*100);});
server.on('sum', bin_validator, (params, channel, resp) => {resp(null, sumTo(params));});
server.on('mul', bin_validator, (params, channel, resp) => {resp(null, mulTo(params));});

server.listenHttp({host:'127.0.0.1', port:3000}, ()=>{console.log('JSON-RPC Server REDY')});