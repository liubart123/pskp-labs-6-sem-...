

const {Sequelize, DataTypes, Model} = require('sequelize');

const {subjects} = require('../authorization/constants.json');

class Commit extends Model {}

/**
 * 
 * @param {Sequelize} sequelize 
 * @param {DataTypes} DataTypes 
 */
module.exports = (sequelize, DataTypes) => {
    //const user = sequelize.define('User', {
    Commit.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        message: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        //authorId
        // password: {
        //     type: DataTypes.STRING,
        //     allowNull: false
        // }
    }, {
        tableName: 'commits',
        modelName: subjects.Commit,
        sequelize: sequelize,
        timestamps: false
    })

    return Commit;
}

