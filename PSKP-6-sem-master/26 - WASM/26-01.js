const express = require('express');
const app = express();
const fs = require('fs');

// 2 задание
//localhost:3000/26-02.html
app.use('/', express.static('public'));


// 3 задание
let wasmCode = fs.readFileSync('public/p.wasm');
let wasmImport = {};
let wasmModule = new WebAssembly.Module(wasmCode);
let wasmInstance = new WebAssembly.Instance(wasmModule, wasmImport);

app.get('/3', (req, res, next)=>{
    res.type('html').send(
        `sum(3,4) = ${wasmInstance.exports.sum(3,4)}<br>` + 
        `sub(3,4) = ${wasmInstance.exports.sub(3,4)}<br>` + 
        `mul(3,4) = ${wasmInstance.exports.mul(3,4)}<br>`
    )
});

app.listen(3000, () => {console.log('The server started');});
