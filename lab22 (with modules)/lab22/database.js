const {Sequelize, DataTypes} = require('sequelize');


const sequelize = new Sequelize({
    host: 'localhost',
    port: 1433,
    database: 'PSCP_LAB22',
    username: 'User',
    password: 'password',
    dialect: 'mssql',
    dialectOptions:{
        options : {
            instanceName: 'SQLEXPRESS' ,
            encrypt: false
        }
    },
    pool: {
        min: 5,
        max: 10
    }
})


const modelsRequirements = [
    require('./user')
];

modelsRequirements.forEach(requirement => {
    requirement(sequelize, DataTypes)
})

//sequelize.sync({force: true});

module.exports = sequelize;