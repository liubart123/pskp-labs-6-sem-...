const Sequelize = require('sequelize')
const sequelize = new Sequelize("LLH", 
    "pskp_user",
    "ZAQwsxcderfv123", 
        {
            dialect: "mssql",
            host: "localhost"
        });
const queries = require('./queries')
const models = require('./init_models');


//db init
sequelize.authenticate()
.then(()=>{
    console.log('db connection was created!');
    models.init(sequelize)
    // queries.selectAll('faculties')
    //     .then(res=>console.log(res))
    //     .catch(err=>console.log(`error: ${err}`))
})
.catch(err=>console.log(`connection error: ${err}`))


//servak
var http = require('http');
const url = require('url');
const fs = require('fs')



writeJsonHeader=(res, status)=>{
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8"
    })
}
writeHtmlHeader=(res, status)=>{
    res.writeHead(status, {
        'Content-Type' : 'text/html; charset=utf-8'
    })
}
writeNoSuchHandler=(req, res)=>{
    res.writeHead(403, {
        'Content-Type' : 'text/plain; charset=utf-8'
    })
    res.end(`{"${req.method}": "${req.url}"}`);
}

let http_handler = (req, res) => {
    switch (req.method) {
        case "GET": GET_handler(req, res); break;
        case "POST": POST_handler(req, res); break;
        case "PUT": PUT_handler(req, res); break;
        case "DELETE": DELETE_handler(req, res); break;
        default: writeNoSuchHandler(req, res); break;
    }
}


let GET_handler = (req, res) => {
    if(url.parse(req.url).pathname === '/api/auditoriumsgt60'){
        queries.auditoriumsgt60()
            .then(answer=>{
                writeJsonHeader(res,200);
                res.end(JSON.stringify(answer));
                // res.end(makeJsonDbResult(answer));
            })
            .catch(err=>{
                writeJsonHeader(res,500);
                res.end(JSON.stringify(err));
            })
    }else if(url.parse(req.url).pathname === '/api/transaction'){
        sequelize.transaction()
            .then(t=>{
                return sequelize.query(
                    'update Auditorium set AUDITORIUM_CAPACITY = AUDITORIUM_CAPACITY',
                    {
                        type:sequelize.QueryTypes.INSERT
                    }
                )
                .then(result=>{
                    writeJsonHeader(res,200);
                    res.end(JSON.stringify({message:`updated ${result} rows`}));
                    setTimeout(()=>t.rollback(),2000);
                })
                .catch(err=>{
                    writeJsonHeader(res,500);
                    res.end(JSON.stringify(err));
                })
            })
    }
    else if (url.parse(req.url).pathname.includes("/api/")) {
        var query = url.parse(req.url).pathname.replace("/api/", "");
        query = decodeURIComponent(query);
        table = /(^\w+$)/.exec(query)
        if (table!=null){
            queries.selectAll(table[1])
            .then(answer=>{
                writeJsonHeader(res,200);
                res.end(JSON.stringify(answer));
                // res.end(makeJsonDbResult(answer));
            })
            .catch(err=>{
                writeJsonHeader(res,500);
                res.end(JSON.stringify(err));
            })
        }else{
            result = /faculties\/([a-zA-Zа-яА-Я0-9 ]+)\/(\w+)/.exec(query);
            if (result!=null){
                queries.selectFacultiesJoin(result[1],result[2])
                    .then(answer=>{
                        writeJsonHeader(res,200);
                        res.end(JSON.stringify(answer));
                    })
                    .catch(err=>{
                        writeJsonHeader(err,500);
                        res.end(JSON.stringify(err));
                    })
            }else {
                writeJsonHeader(res,404);
                res.end(JSON.stringify({error:'invalid url :('}))
            }
        }
    } else if (url.parse(req.url).pathname === '/') {
        // let html = fs.createReadStream('index.html');
        let html = fs.readFileSync('index.html');
        // writeHtmlHeader(res,200);
        
        res.writeHead(200, {
            'Content-Type' : 'text/html;charset=utf-8'
        });
        // html.pipe(res);
        res.end(html);
    }
    else{
        writeJsonHeader(res,404);
        res.end(JSON.stringify({error:'incorect url'}));
    }


}

getJson=(json)=>{
    try{
        let res = JSON.parse(json);
        return res;
    }catch (e){
        console.error(e);
        return false;
    }
}

let POST_handler = (req, res) => {
    if (url.parse(req.url).pathname.includes("/api/")) {
        var query = url.parse(req.url).pathname.replace("/api/", "");
        query = decodeURIComponent(query);
        table = /(^\w+$)/.exec(query)
        let recievedJson = "";
        if (table!=null){
            req.on('data', (data) => {
                recievedJson += data;
            });
            req.on('end', () => {
                insertedObject=getJson(recievedJson)
                if (insertedObject!=false){
                    queries.insert(table[1],insertedObject)
                    .then(answer=>{
                        writeJsonHeader(res,200);
                        res.end(JSON.stringify(answer));
                        // res.end(makeJsonDbResult(answer));
                    })
                    .catch(err=>{
                        writeJsonHeader(res,500);
                        if (err.errors!=undefined)
                            res.end(JSON.stringify(err.errors));
                        else 
                            res.end(JSON.stringify(err));
                    })
                }else {
                    writeJsonHeader(res,503);
                    res.end(JSON.stringify({error:'invalid json object:('}))
                }
            })
        }else{
            writeJsonHeader(res,404);
            res.end(JSON.stringify({error:'invalid url :('}))
        }
    } else {
        writeJsonHeader(res,404);
        res.end(JSON.stringify({error:'invalid url :('}))
    }

}


let DELETE_handler = (req, res) => {

    let urlPathname = decodeURIComponent(url.parse(req.url).pathname);
    regRes = /^\/api\/(\w+)\/([a-zA-Zа-яА-ЯіІўЎ0-9]+)$/.exec(urlPathname)
    if (regRes!=null){
        queries.destroy(regRes[1],regRes[2])
            .then(answer=>{
                writeJsonHeader(res,200);
                res.end(JSON.stringify(answer));
                // res.end(makeJsonDbResult(answer));
            })
            .catch(err=>{
                writeJsonHeader(res,500);
                if (err.errors!=undefined)
                    res.end(JSON.stringify(err.errors));
                else 
                    res.end(JSON.stringify(err));
            })
    }else {
        writeJsonHeader(res,404);
        res.end(JSON.stringify({error:'invalid url :('}))
    }
}

let PUT_handler = (req, res) => {

    let urlPathname = decodeURIComponent(url.parse(req.url).pathname);
    regRes = /^\/api\/(\w+)$/.exec(urlPathname)
    if (regRes!=null){
        let recievedJson = "";
        req.on('data', (data) => {
            recievedJson += data;
        });
        req.on('end', () => {
            insertedObject=getJson(recievedJson)
            if (insertedObject!=false){
                queries.update(regRes[1],insertedObject)
                .then(answer=>{
                    writeJsonHeader(res,200);
                    res.end(JSON.stringify(answer));
                    // res.end(makeJsonDbResult(answer));
                })
                .catch(err=>{
                    writeJsonHeader(res,500);
                    if (err.errors!=undefined)
                        res.end(JSON.stringify(err.errors));
                    else 
                        res.end(JSON.stringify(err));
                })
            }else {
                writeJsonHeader(res,503);
                res.end(JSON.stringify({error:'invalid json object:('}))
            }
        })
    }else {
        writeJsonHeader(res,404);
        res.end(JSON.stringify({error:'invalid url :('}))
    }
}



let server = http.createServer();
server.listen(3000, (v) => {
    console.log("server.listen(3000)");
}).on('error', (e) => {
    console.log("server.listen(3000); error: ", e);
}).on('request', http_handler);