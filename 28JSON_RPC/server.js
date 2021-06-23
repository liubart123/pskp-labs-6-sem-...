const JsonRPCSever = require('jsonrpc-server-http-nats');
const server = new JsonRPCSever();

let bin_validator = (size=-1)=>{
    return (params)=> {
        console.log('validation: ', params);
        if(!Array.isArray(params))   throw new Error('need array paramereters');
            params.forEach(p=>{if(!isFinite(p))    throw new Error ('need numba')});
        if (size>0){
            if (size!=params.length){
                throw new Error('wrong array size');
            }
        }
        return params;
    }
}

let sumTo = (par)=>{
    var sum = 0;
    for(var i=0; i<par.length; i++){
        sum+=parseInt(par[i]);
    }
    return sum;
}

let mulTo = (par)=>{
    var mul = 1;
    for(var i=0; i<par.length; i++){
        mul*=parseInt(par[i]);
    }
    return mul;
}

server.on('div', bin_validator(2), (params, channel, response) => {response(null, params[0]/params[1]);});
server.on('proc', bin_validator(2), (params, channel, response) => {response(null, params[0]/params[1]*100);});
server.on('sum', bin_validator(), (params, channel, response) => {response(null, sumTo(params));});
server.on('mul', bin_validator(), (params, channel, response) => {response(null, mulTo(params));});

server.listenHttp({host:'127.0.0.1', port:3000}, ()=>{console.log('server is running...Why?')});