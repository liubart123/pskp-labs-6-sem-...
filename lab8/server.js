const app = require('express')();
const Sequelize = require('sequelize');
const sequelize = new Sequelize('asp_dictionary',
    "pskp_user",
    "ZAQwsxcderfv123",
    {
        dialect: "mssql",
        host: "localhost"
    });
models = require('./models');

sequelize.authenticate()
    .then(() => {
        console.log('db connection was created!');
        models = models.init(sequelize);
    })
    .catch(err => console.log(`connection error: ${err}`));


app.use((req, res, next) => {
    res.sendStatus(404);
});

app.listen(3000);