const Sequelize = require('sequelize');
let User, Repo,Commit;
module.exports.init=(sequalize)=>{
    User = sequalize.define(
        'user',
        {
            id:{
                type:Sequelize.INTEGER,
                autoIncrement:true,
                primaryKey:true
            },
            name:{
                type:Sequelize.STRING,
                allowNull:false,
                field:'username'
            },
            email:{
                type:Sequelize.STRING,
                allowNull:false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            role:{
                type:Sequelize.STRING,
                allowNull:true,
                defaultValue: "user"
            }
        },
        {
            sequalize,
            tableName: 'users',
            timestamps: false,
        }
    );

    Repo = sequalize.define(
        'repo',
        {
            id:{
                type:Sequelize.INTEGER,
                autoIncrement:true,
                primaryKey:true
            },
            name:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            authorId:{
                type:Sequelize.INTEGER,
                allowNull:false,
                field:'authorId',
                references: {
                    model: User, 
                    key: 'id'
                }
            },
        },
        {
            sequalize,
            tableName: 'repos',
            timestamps: false,
        }
    );
    Commit = sequalize.define(
        'commit',
        {
            id:{
                type:Sequelize.INTEGER,
                autoIncrement:true,
                primaryKey:true
            },
            message:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            repoId:{
                type:Sequelize.INTEGER,
                allowNull:true,
                field:'repoId',
                references: {
                    model: Repo, 
                    key: 'id'
                }
            },
        },
        {
            sequalize,
            tableName: 'commits',
            timestamps: false,
        }
    );
    User.hasMany(Repo,{as:'repos',foreignKey: 'authorId'})
    Repo.hasMany(Commit,{as:'commits'})
};
exports.User = ()=>User;
exports.Repo = ()=>Repo;
exports.Commit = ()=>Commit;