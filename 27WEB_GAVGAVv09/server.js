const Express = require('express');
const app = Express();

const fs=require('fs');

const TOKEN = 'AgAAAABPslRRAAbW1uV7-ix18UHBg1zmhuC_0P0';
const {AuthType,createClient} = require('webdav');
const client = createClient(
    // 'https://dav.dropdav.com',
    'https://webdav.yandex.ru',
    // 'https://drive.google.com',
{
        // authType: AuthType.Password,
        // username:'liubart@tut.by',
        // username:'liubart7@gmail.com',
        // username:'AJI6EPT228',
        // password:'ZAQwsxcderfv123'
        
    token: {
        token_type: 'OAuth',
        access_token: TOKEN
    }
});

try{
    // client.exists('/pskp')
    client.createWriteStream('/as.txt').pipe(fs.createReadStream('./asd.txt'));
    // client.createDirectory('as')
    // // client.exists('/lcs.js')
    // .then(e=>console.log(e))
    // .catch(e=>console.log(e));

    client.getDirectoryContents('/')
    .then(e=>console.log(e))
    .catch(e=>console.log(e))

    // client.createDirectory('pskp')
    // .then(e=>console.log(e))
    // .catch(e=>console.log(e))
}catch(e){
    console.log(e);
}

app.post('/md/:dir',async function(req,res)
{
    let ixist = await client.exists('/'+req.params.dir);
    if (ixist){
        res.sendStatus(408);
    }else {
        let result = await client.createDirectory('/'+req.params.dir);
        res.sendStatus(200);
    }
});
app.post('/rd/:dir',async function(req,res)
{
    let ixist = await client.exists('/'+req.params.dir);
    if (ixist){
        client.deleteFile('/'+req.params.dir);
        res.sendStatus(200);
    }else {
        res.sendStatus(404);
    }
});

app.post('/up/:file',async function(req,res)
{
    if(fs.existsSync('./files/'+req.params.file)){
        let ws = client.createWriteStream('/'+req.params.file);
        let rs = fs.createReadStream('./files/'+req.params.file);
        rs.pipe(ws);
        res.sendStatus(200);
    }else {
        res.sendStatus(408);
    }
});

app.post('/down/:file',async function(req,res)
{
    if(await client.exists('/'+req.params.file)){
        let rs = client.createReadStream('/'+req.params.file);
        let ws = fs.createWriteStream('./files/'+req.params.file);
        rs.pipe(ws);
        res.sendStatus(200);
    }else {
        res.sendStatus(404);
    }
});

app.post('/del/:file',async function(req,res)
{
    if(await client.exists('/'+req.params.file)){
        client.deleteFile('/'+req.params.file);
        res.sendStatus(200);
    }else {
        res.sendStatus(404);
    }
});


app.post('/copy/:file/:destination',async function(req,res)
{
    let ixist = await client.exists('/'+req.params.file);
    if(ixist){
        client.copyFile('/'+req.params.file,'/'+req.params.destination);
        res.sendStatus(200);
    }else {
        res.sendStatus(404);
    }
});
app.post('/move/:file/:destination',async function(req,res)
{
    let ixist = await client.exists('/'+req.params.file);
    if(ixist){
        client.moveFile('/'+req.params.file,'/'+req.params.destination);
        res.sendStatus(200);
    }else {
        res.sendStatus(404);
    }
});


app.use('/',(err,req,res,nex)=>{
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(3000,()=>{console.log('server is running... Why?');});

