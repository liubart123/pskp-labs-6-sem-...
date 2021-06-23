const webdav = require('webdav-server').v2;
const server = new webdav.WebDAVServer({port:3000});
const express=require('express');
const app = require('express')();
const fs=require('fs');
const {createClient} = require('webdav');
const client = createClient('https://webdav.yandex.ru', {username:'juliaa.klepaski',password:'Cvthnmyfgj7'});
const multer  = require("multer");
app.use(express.static('publ'));
app.use(multer().single("file"));

server.setFileSystem('/',new webdav.PhysicalFileSystem('./files'),(success)=>
{
    server.start(()=>{console.log('READY');});
    app.listen(1998);
});


app.post('/md/[A-я,0-9,%,/,.]+',function(req,res)
{
    let s ='/'+req.url.split('/')[2];
    console.log(s);
    let url = decodeURI(s);
    client.exists(url).then((result)=>
    {
        if (!result)
        { 
            client.createDirectory(url);
            res.end('Директория создана успешно');
        }
        else
        {
            //res.writeHead(408,{'Content-Type': 'text/plain;charset=utf-8'})
            res.end('Такая директория уже существует');
        }
    })
    .catch((err)=> 
    {
        console.log(err);
    })
});


app.post('/rd/[A-я,0-9,%,.]+',function(req,res)
{
    let s ='/'+req.url.split('/')[2];
    let url = decodeURI(s);
    client.exists(url).then((result)=>
    {
        if (result)
        {
            client.deleteFile(url);
            res.end('Директория удалена успешно');
        }
        else
        {
            //res.writeHead(408,{'Content-Type': 'text/plain;charset=utf-8'})
            res.end('Такой директории не существует');
        }
    })
    .catch((err)=>
    {
        console.log(err);
    })
});


app.post('/up/[A-я,0-9,%,.]+',function(req,res)
{
    let s ='/'+req.url.split('/')[2];
    let url = decodeURI(s);
    console.log(req.file);
    try
    {
        let rs = fs.createReadStream('./files/'+url);
        let ws = client.createWriteStream("up.jpg");
        rs.pipe(ws);
        res.end('Файл успешно выгружен');
    }
    catch(err)
    {
        console.log(err);
        //res.writeHead(408,{'Content-Type': 'text/plain;charset=utf-8'})
        res.end('Ошибка записи');
    }
});


app.post('/down/[A-я,0-9,%,.]+',function(req,res)
{
    let s ='/'+req.url.split('/')[2];
    let url = decodeURI(s);
    client.exists(url).then((result)=>
    {
        if (result)
        {
            client.createReadStream(url).pipe(fs.createWriteStream('./files/down.jpg'));
            res.end('Файл успешно скачан');
        }
        else
        {
            //res.writeHead(404,{'Content-Type': 'text/plain;charset=utf-8'})
            res.end('Такого файла не существует');
        }
    })
    .catch((err)=>
    {
        console.log(err);
    })
});


app.post('/del/[A-я,0-9,%,.]+',function(req,res)
{
    let s ='/'+req.url.split('/')[2];
    let url = decodeURI(s);
    client.exists(url).then((result)=>
    {
        if (result)
        {
            client.deleteFile(url);
            res.end('Файл удален успешно');
        }
        else
        {
            //res.writeHead(404,{'Content-Type': 'text/plain;charset=utf-8'})
            res.end('Такого файла не существует');
        }
    })
    .catch((err)=>
    {
        console.log(err);
    })
});


app.post('/copy/[A-я,0-9,%,.]+/[A-я,0-9,%,.]+',function(req,res)
{
    let s ='/'+req.url.split('/')[2];
    let d ='/'+req.url.split('/')[3];
    let source = decodeURI(s);
    let destination = decodeURI(d);
    client.exists(source).then((result)=>
    {
        if (result)
        {
            client.copyFile(source,destination);
            res.end('Файл скопирован успешно');
        }
        else
        {
            //res.writeHead(404,{'Content-Type': 'text/plain;charset=utf-8'})
            res.end('Такого файла не существует');
        }
    })
    .catch((err)=>
    {
        console.log(err);
    })
});


app.post('/move/[A-я,0-9,%,.]+/[A-я,0-9,%,.]+',function(req,res)
{
    let s ='/'+req.url.split('/')[2];
    let d ='/'+req.url.split('/')[3];
    let source = decodeURI(s);
    let destination = decodeURI(d);
    client.exists(source).then((result)=>
    {
        if (result)
        {
            client.moveFile(source,destination);
            res.end('Файл перемещен успешно');
        }
        else
        {
            //res.writeHead(404,{'Content-Type': 'text/plain;charset=utf-8'})
            res.end('Такого файла не существует');
        }
    })
    .catch((err)=>
    {
        console.log(err);
    })
});

app.get('/html',function(req,res)
{
    res.end(fs.readFileSync('./lab24.html'))
})