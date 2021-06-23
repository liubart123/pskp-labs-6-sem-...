

const {Sequelize, DataTypes, Model} = require('sequelize');

const {subjects} = require('../authorization/constants.json');

class User extends Model {}

/**
 * 
 * @param {Sequelize} sequelize 
 * @param {DataTypes} DataTypes 
 */
module.exports = (sequelize, DataTypes) => {
    //const user = sequelize.define('User', {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(16),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        role: {
            type: DataTypes.STRING(5),
            allowNull: false,
            //values: ['user', 'admin']
            validate: {
                isIn: [['user', 'admin']]
            },
            defaultValue: 'user'
        }
    }, {
        tableName: 'users',
        modelName: subjects.User,
        sequelize: sequelize,
        timestamps: false
    })

    return User;
}

