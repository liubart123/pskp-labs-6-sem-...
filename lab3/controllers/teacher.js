const Sequelize = require('sequelize')
const sequelize = new Sequelize("LLH", 
    "pskp_user",
    "ZAQwsxcderfv123", 
        {
            dialect: "mssql",
            host: "localhost"
        });
const queries = require('../queries')
const models = require('../init_models');


//db init
sequelize.authenticate()
.then(()=>{
    console.log('teacher controller db connection was created!');
    models.init(sequelize)
    // queries.selectAll('teachers')
    //     .then(res=>console.log(res))
    //     .catch(err=>console.log(`error: ${err}`))
})
.catch(err=>console.log(`connection error: ${err}`))


var express = require('express');
var router = express.Router();

errorCathcer=(res,err)=>{
    let errorMsg;
    if (err.errors!=undefined)
        errorMsg = JSON.stringify(err.errors);
    else if (JSON.stringify(err)!={})
        errorMsg = JSON.stringify(err);
    else 
        errorMsg = err;
    res
        .status(500)
        .send("Server error: " + errorMsg);
}

router.get('/', function(req, res) {
    if (req.query!=null && req.query!=undefined && req.query.id!=undefined){
        queries.selectOne('teachers',req.query.id)
        .then(answer=>{
            res.type("json");
            res.send(JSON.stringify(answer));
            // res.end(makeJsonDbResult(answer));
        })
        .catch(err=>{
            res
                .status(500)
                .send("Server error: " + err);
        })
    }else{
        queries.selectAll('teachers')
        .then(answer=>{
            res.type("json");
            res.send(JSON.stringify(answer));
            // res.end(makeJsonDbResult(answer));
        })
        .catch(err=>{
            errorCathcer(res,err);
        })
    }
});

router.post('/', function(req, res) {
    // console.log(req.body);
    if(!req.body || !req.is('application/json')) 
    {
        return res.sendStatus(400);
    }
    else {
        queries.selectOne('teachers',req.body.teacher)
            .then((result)=>{
                if (result!=undefined)
                    return new Promise((resolve,reject)=>{
                        reject("this element is already exist");
                    })
            })
            .then(()=>{
                return queries.insert("teachers",req.body)
            })
            .then(answer=>{
                res.type("json");
                res.send(JSON.stringify(answer));
            })
            .catch(err=>{
                errorCathcer(res,err);
            })
    }
});


router.delete('/', function(req, res) {
    if (req.query!=null && req.query!=undefined && req.query.id!=undefined){
        queries.destroy('teachers',req.query.id)
        .then(answer=>{
            res.type("json");
            res.status(204);
            res.send(JSON.stringify(answer));
            // res.end(makeJsonDbResult(answer));
        })
        .catch(err=>{
            errorCathcer(res,err);
        })
    }else{
        res.statusMessage(400);
    }
});


router.put('/', function(req, res) {
    // console.log(req.body);
    if(!req.body || !req.is('application/json')) 
    {
        return res.sendStatus(400);
    }
    else {
        queries.selectOne('teachers',req.body.teacher)
        queries.update("teachers",req.body)
            .then(answer=>{
                res.type("json");
                res.send(JSON.stringify(answer));
            })
            .catch(err=>{
                errorCathcer(res,err);
            })
    }
});


module.exports = router;
