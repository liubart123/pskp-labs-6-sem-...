const express = require('express');

const app = express();


const PORT = 3000;


//const database = require('./models/database');

//database.sync({force: true});


const bodyParser = require('body-parser');

app.use(bodyParser.json({
    //он и так по умолчанию true, но как обычно явно заадл
    strict: true
}))


const secretKey = require('./jwt.json')["secret-key"];

const cookieParser = require('cookie-parser');

app.use(cookieParser(secretKey, {
    
}))



const {Ability, AbilityBuilder, ForbiddenError} = require('@casl/ability');

const NotFoundError = require('./NotFoundError');

const databaseSERvice = require('./database-requests');

app.use((req,res, next) => {
    console.log(req.url);
    next();
})

const caslMiddleware = require('./authorization/middleware');
app.use('/api/*', caslMiddleware);



app.get('/api/ability', (req, res, next) => {

    //req.ability.throwUnlessCan('read', 'ability');

    //let result = req.ability.can('read', 'ability');

    res.json(req.ability.rules);
    
})

//после этого другие не могут быть .use() и другие методы
//const authRouter = 
require('./routers/authRouter')(app);


const userRouter = require('./routers/userRouter');
const repoRouter = require('./routers/repoRouter');


//app.use('/', authRouter);

app.use('/api/users', userRouter);

app.use('/api/repos', repoRouter);






app.use((req, res, next) => {
    res.sendStatus(404);
})

app.use((err, req, res, next) => {

    console.error(err);


    if (err instanceof ForbiddenError) {
        res.status(403);
    }
    else if (err instanceof NotFoundError) {//err.name === 'NotFoundError') {
        res.status(404);
    }
    else {
        res.status(500);
    }

    res.json({message: err.message});

    // if (err instanceof ForbiddenError) {
    //     res.status(403).json({message: err.message});
    // }
    // else if (err instanceof NotFoundError) {
    //     res.status(404).json({message:err.message});
    // }
    // else {
    //     res.status(500).send(err.message);
    // }
    
    // next();
})

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} port`);
})