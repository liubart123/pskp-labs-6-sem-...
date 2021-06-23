

//https://wasdk.github.io/WasmFiddle/

//https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm

//https://habr.com/ru/post/475778/

//emcc запускал оттуда же, откуда и установил (из того ж трминала), так как так было сделать проще
//The changes made to environment variables only apply to the currently running shell instance.
//Use the 'emsdk_env.bat' to re-enter this environment later,
//or if you'd like to permanently register this environment permanently,
//rerun this command with the option --permanent.

//пришлось использовать и данный флаг, так как в точке входа смысла не было, ,а скомпилипровать иначе было нельзя, так как
//Error: Aborting compilation due to previous errors

//warning: To build in STANDALONE_WASM mode without a main(), use emcc --no-entry

const express = require('express');
const app = express();

// const http = require('http');
const fs = require('fs');

const path = require('path');

const PORT = 5000;


const FUNCTIONS_WASM_FILE_PATH = path.join(__dirname, './functions.wasm');
const STATIC_DIRECTORY_PATH = path.join(__dirname, './static');

const wasmCode = fs.readFileSync(FUNCTIONS_WASM_FILE_PATH);

let wasmImports = {};
let wasmModule = new WebAssembly.Module(wasmCode);
let wasmInstance = new WebAssembly.Instance(wasmModule, wasmImports);
const {sum, mul, sub} = wasmInstance.exports;

const x = 10, y = 20;



// function sumJS(x, y) {
//     return x+y;
// }

app.use('/static', express.static(STATIC_DIRECTORY_PATH));

app.get('/functions.wasm', (req, res, next) => {
    res.setHeader('Content-Type', 'application/wasm')
    // fs.createReadStream(FUNCTIONS_WASM_FILE_PATH).pipe(res);
    res.send(wasmCode);
})

app.get('/check' , (req, res, next) => {

    res.setHeader('Content-Type', 'text/plain');
    let responseText = `sum(${x}, ${y}) = ${sum(x, y)}\nmul(${x}, ${y}) = ${mul(x, y)}\nsub(${x}, ${y}) = ${sub(x, y)}`;
    res.send(responseText);
})


// const server = http.createServer((req, res) => {


//     //очевидно, что для таких простых случае was m н дсат прирост в проихводительностИ ,а, наоборот, может её ухудшить

//     // let operationResult;

//     // console.log('wasm sum');
//     // let startTime = Date.now();
//     // for (let k = 100000; k < 1000000000; k*=10) {
//     //     for (let iter = 0; iter < k; iter++) {
//     //         operationResult = sum(iter, iter);
//     //     }
//     // }
//     // console.log(`Time passed: ${Date.now() - startTime}`);

//     // console.log('just sum');
//     // startTime = Date.now();
//     // for (let k = 100000; k < 1000000000; k*=10) {
//     //     for (let iter = 0; iter < k; iter++) {
//     //         operationResult = iter + iter;
//     //     }
//     // }
//     // console.log(`Time passed: ${Date.now() - startTime}`);


//     // console.log('sumJS');
//     // startTime = Date.now();
//     // for (let k = 100000; k < 1000000000; k*=10) {
//     //     for (let iter = 0; iter < k; iter++) {
//     //         operationResult = sumJS(iter, iter);
//     //     }
//     // }
//     // console.log(`Time passed: ${Date.now() - startTime}`);

    
//     if (req.method == 'GET') {

//         if (req.url == '/') {
//             fs.createReadStream('./index.html').pipe(res);
//         }
//         //если тупо так отдавать ответ и нен менять MIME_type, то будет ошибка в WebAssembly.oinstantiateStreaming
//         //Uncaught (in promise) TypeError: Failed to execute 'compile' on 'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.
//         else if (req.url == '/functions.wasm') {
//             res.writeHead(200, {'Content-Type': 'application/wasm'});
//             fs.createReadStream('./functions.wasm').pipe(res);
//         }
//         else if (req.url == '/check') {

//             res.writeHead(200, {'Content-Type': 'text/plain'});

//             let responseText = `sum(${x}, ${y}) = ${sum(x, y)}\nmul(${x}, ${y}) = ${mul(x, y)}\nsub(${x}, ${y}) = ${sub(x, y)}`;

//             res.end(responseText);
//         }
//     }
// })

// server.listen(PORT, () => {
//     console.log(`Server is listening on ${PORT} port`);
// })

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} port`);
})

// server.on('error', (err) => {
//     console.error(err);
// })