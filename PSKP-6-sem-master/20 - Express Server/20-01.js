const express=require('express');
const app = require('express')();
const hbs=require('express-handlebars').create({extname:'.hbs'});
const fs=require('fs');
const bodyParser = require("body-parser");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('port',3000);
app.engine('.hbs',hbs.engine);
app.set('view engine','.hbs');

app.get('/',(req,res,next)=>
{
    fs.readFile('./Telephones.json',(e,data)=>
    {
        if(e) console.log('Ошибка: ',e);
        else {
                    let os=JSON.parse(data);
        res.render('index',{names:os})
        }
    }
    );
})
app.get('/Add',(req,res,next)=>
{
    fs.readFile('./Telephones.json',(e,data)=>
    {
        if(e) console.log('Ошибка: ',e);
        else {
                    let os=JSON.parse(data);
        res.render('Add',{names:os,logicif:true})
        }
    }
    );
});
app.post('/Add',function(req,res)
{
    let body=req.body.String;
    let result2='[';
    console.log(body);
     let result=(body.split("  ")).filter(function (el) {
        return el != "";
      });
    result[1] = result[1].replace(/\s+/g, '');
    fs.readFile('./Telephones.json',(e,data)=>
    {
        if(e) console.log('Ошибка: ',e);
        else {
            let os=JSON.parse(data);
            os.forEach(element => {
            result2+=`{ "FIO":"${element.FIO}","Telephone":"${element.Telephone}"},`;
        });
        }
        result2+=`{"FIO":"${result[0]}","Telephone":"${result[1]}"}]`;
        fs.writeFile('./Telephones.json', result2,(e)=>
        {
            if(e) throw e;
            console.log("Запись успешно завершена");
        });
        fs.readFile('./Telephones.json',(e,data)=>
        {
            if(e) console.log('Ошибка: ',e);
            else {
                        let os=JSON.parse(data);
            res.render('index',{names:os})
            }
        });
    });  
});
app.get('/Update',(req,res,next)=>
{

    fs.readFile('./Telephones.json',(e,data)=>
    {
        if(e) console.log('Ошибка: ',e);
        else {
                    let os=JSON.parse(data);
        res.render('Update',{names:os,FIO:req.query.FIO,Telephone:req.query.Telephone,logicif:true})
        }
    }
    );
});
app.post('/Update',function(req,res)
{
    let body=req.body.String;
    let result2='[';
    console.log(body);
     let result=(body.split("  ")).filter(function (el) {
        return el != "";
      });
    result[1] = result[1].replace(/\s+/g, '');
    console.log(result);
    fs.readFile('./Telephones.json',(e,data)=>
    {
        if(e) console.log('Ошибка: ',e);
        else {
            let os=JSON.parse(data);
            os.forEach(element => {
            if(result[0]==element.FIO)
            {
                result2+=`{ "FIO":"${result[0]}","Telephone":"${result[1]}"},` 
            }
            else
            {
                result2+=`{ "FIO":"${element.FIO}","Telephone":"${element.Telephone}"},`;
            }
        });
        }
        result2=result2.substring(0,result2.length-1);
        result2+=']';
        fs.writeFile('./Telephones.json', result2,(e)=>
        {
            if(e) throw e;
            console.log("Запись успешно завершена");
        });
        fs.readFile('./Telephones.json',(e,data)=>
        {
            if(e) console.log('Ошибка: ',e);
            else {
            let os=JSON.parse(data);
            res.render('index',{names:os})
            }
        });
    });
});
app.post('/Delete',function(req,res)
{
    let body=req.body.String;
    let result2='[';
    console.log(body);
     let result=(body.split("  ")).filter(function (el) {
        return el != "";
      });
    result[1] = result[1].replace(/\s+/g, '');
    console.log(result);
    fs.readFile('./Telephones.json',(e,data)=>
    {
        if(e) console.log('Ошибка: ',e);
        else {
            let os=JSON.parse(data);
            os.forEach(element => {
            if(result[0]!=element.FIO && result[1]!=element.Telephone)
            {
                result2+=`{ "FIO":"${element.FIO}","Telephone":"${element.Telephone}"},`;
            }
        });
        }
        result2=result2.substring(0,result2.length-1);
        result2+=']';
        fs.writeFile('./Telephones.json', result2,(e)=>
        {
            if(e) throw e;
            console.log("Удаление успешно завершено");
        });
        fs.readFile('./Telephones.json',(e,data)=>
        {
            if(e) console.log('Ошибка: ',e);
            else {
            let os=JSON.parse(data);
            res.render('index',{names:os})
            }
        });
    });
});
//var server=app.listen(app.get('port'));
var server=app.listen(process.env.PORT || app.get('port'));