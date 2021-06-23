
const {Sequelize, DataTypes} = require('sequelize');

//TODO: https://sequelize.org/master/manual/advanced-many-to-many.html
//придётчся определять модели для M:M, так как иначе пытается достать updated_at в промужуточной таблице, а там его нет, так как я сам ег оне поределял

const sequelize = new Sequelize({
    dialect: 'mssql',

    host: 'localhost',
    port: 1433,
    database: 'PSCP_LAB24_APTEM',

    username: 'User',
    password: 'password',

    pool: {
        min: 5,
        max: 10
    }
    
});

const modelDefiners = [
    require('./models/user'),
    require('./models/repo'),
    require('./models/commit')
	// Add more models here...
	// require('./models/item'),
];

for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize, DataTypes);
}

const modelsRelations = require('./models/models-associations');

modelsRelations(sequelize);


module.exports = sequelize;