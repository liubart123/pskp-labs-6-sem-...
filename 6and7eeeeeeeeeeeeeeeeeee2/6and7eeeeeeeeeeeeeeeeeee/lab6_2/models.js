const Sequelize = require('sequelize')

module.exports.init=(sequalize)=>{
    const User = sequalize.define(
        'user',
        {
            id:{
                type:Sequelize.INTEGER,
                autoIncrement:true,
                primaryKey:true
            },
            name:{
                type:Sequelize.STRING,
                allowNull:true,
                unique:true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true,
            }
        },
        {
            sequalize,
            tableName: 'user',
            timestamps: false,
        }
    );

    exports.User = User;
}