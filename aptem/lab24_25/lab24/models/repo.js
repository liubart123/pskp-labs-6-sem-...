

const {Sequelize, DataTypes, Model} = require('sequelize');

const {subjects} = require('../authorization/constants.json');

class Repo extends Model {}

/**
 * 
 * @param {Sequelize} sequelize 
 * @param {DataTypes} DataTypes 
 */
module.exports = (sequelize, DataTypes) => {
    //const user = sequelize.define('User', {
    Repo.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
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
        tableName: 'repos',
        modelName: subjects.Repo,
        sequelize: sequelize,
        timestamps: false
    })

    return Repo;
}

