const Sequelize = require('sequelize');

module.exports.init=(sequalize)=>{
    const User = sequalize.define(
        'user',
        {
            id:{
                type:Sequelize.INTEGER,
                autoIncrement:true,
                primaryKey:true
            },
            username:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            email:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            role:{
                type:Sequelize.STRING,
                allowNull:true,
            }
        },
        {
            sequalize,
            tableName: 'user',
            timestamps: false,
        }
    );

    const Repo = sequalize.define(
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
                allowNull:true,
                field:'author_id',
                references: {
                    model: User, 
                    key: 'id'
                }
            },
        },
        {
            sequalize,
            tableName: 'repo',
            timestamps: false,
        }
    );
    const Commit = sequalize.define(
        'Commit',
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
                field:'repo_id',
                references: {
                    model: Repo, 
                    key: 'id'
                }
            },
        },
        {
            sequalize,
            tableName: 'commit',
            timestamps: false,
        }
    );

    exports.User = User;
    exports.Repo = Repo;
    exports.Commit = Commit;
};