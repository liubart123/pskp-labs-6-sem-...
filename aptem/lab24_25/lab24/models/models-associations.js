

const {Sequelize} = require('sequelize');

/**
 * 
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {

    const {User, Repo, Commit} = sequelize.models;


    //https://sequelize.org/v3/docs/associations/
    // var City = sequelize.define('city', { countryCode: Sequelize.STRING });
    // var Country = sequelize.define('country', { isoCode: Sequelize.STRING });

    // // Here we can connect countries and cities base on country code
    // Country.hasMany(City, {foreignKey: 'countryCode', sourceKey: 'isoCode'});
    // City.belongsTo(Country, {foreignKey: 'countryCode', targetKey: 'isoCode'});


    User.hasMany(Repo, {
        as: 'Repos',
        foreignKey: {
            name: 'authorId',
            allowNull: false
        },
        sourceKey: 'id'
    })

    Repo.belongsTo(User, {
        as: 'User',
        foreignKey: {
            name: 'authorId',
            allowNull: false
        },
        targetKey: 'id'
    })


    Repo.hasMany(Commit, {
        as: 'Commits',
        //в скрипте так было:
        //[repoId] INT NULL DEFAULT NULL
        foreignKey: {
           name: 'repoId',
           allowNull: true
        },
        sourceKey: 'id'
    })

    Commit.belongsTo(Repo, {
        as: 'Repo',
        //в скрипте так было:
        //[repoId] INT NULL DEFAULT NULL
        foreignKey: {
            name: 'repoId',
            allowNull: true
        },
        targetKey: 'id'
    })

    
}