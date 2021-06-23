const Sequelize = require('sequelize')
exports.init = (sequelize)=>{
    const Faculty = sequelize.define(
        'Faculty',
        {
            faculty:{type:Sequelize.STRING,allowNull:false, primaryKey:true},
            faculty_name:{type:Sequelize.STRING,allowNull:false}
        },
        {
            sequelize,
            tableName: 'Faculty',
            timestamps: false,
            hooks:{
                beforeCreate:(instance, options)=>{
                    console.log(`before inserted`);
                },
                afterCreate:(instance, options)=>{
                    console.log(`after inserted`);
                }
            }
        }
    )
    const Pulpit = sequelize.define(
        'Pulpit',
        {
            pulpit:{type:Sequelize.STRING,allowNull:false, primaryKey:true},
            pulpit_name:{type:Sequelize.STRING,allowNull:false},
            faculty:{type:Sequelize.STRING, allowNull :false,
                references:{model:Faculty,key:'faculty'}}
        },
        {
            sequelize,
            tableName: 'Pulpit',
            timestamps: false
        }
    )
    const Subject = sequelize.define(
        'Subject',
        {
            subject:{type:Sequelize.STRING,allowNull:false, primaryKey:true},
            subject_name:{type:Sequelize.STRING,allowNull:false},
            pulpit:{type:Sequelize.STRING, allowNull :false,
                references:{model:Pulpit,key:'pulpit'}}
        },
        {
            sequelize,
            tableName: 'Subject',
            timestamps: false
        }
    )
    const Teacher = sequelize.define(
        'Teacher',
        {
            teacher:{type:Sequelize.STRING,allowNull:false, primaryKey:true},
            teacher_name:{type:Sequelize.STRING,allowNull:false},
            pulpit:{type:Sequelize.STRING, allowNull :false,
                references:{model:Pulpit,key:'pulpit'}}
        },
        {
            sequelize,
            tableName: 'Teacher',
            timestamps: false
        }
    )
    const AuditoriumType = sequelize.define(
        'AuditoriumType',
        {
            auditorium_type:{type:Sequelize.STRING,allowNull:false, primaryKey:true},
            auditorium_typename:{type:Sequelize.STRING,allowNull:false},
        },
        {
            sequelize,
            tableName: 'Auditorium_type',
            timestamps: false
        }
    )

    const Auditorium = sequelize.define(
        'Auditorium',
        {
            auditorium:{type:Sequelize.STRING,allowNull:false, primaryKey:true},
            auditorium_name:{type:Sequelize.STRING,allowNull:false},
            auditorium_capacity:{type:Sequelize.INTEGER,allowNull:false},
            auditorium_type:{type:Sequelize.STRING, allowNull :false,
                references:{model:AuditoriumType,key:'auditorium_type'}
            }
        },
        {
            sequelize,
            tableName: 'Auditorium',
            timestamps: false,
            scopes:{
                auditoriumsgt60:{
                    where:{
                        auditorium_capacity:{
                            [Sequelize.Op.gte]:60
                        }
                    }
                }
            }
        }
    )
    Faculty.hasMany(Pulpit,{onDelete:'cascade', foreignKey:'faculty'})
    Pulpit.hasMany(Subject,{onDelete:'cascade', foreignKey:'pulpit'})
    Pulpit.hasMany(Teacher,{onDelete:'cascade', foreignKey:'pulpit'})
    Auditorium.hasOne(AuditoriumType,{onDelete:'cascade', foreignKey:'auditorium_type', as:'type'})
    exports.Faculty = Faculty;
    exports.Pulpit = Pulpit;
    exports.Teacher = Teacher;
    exports.Subject = Subject;
    exports.Auditorium = Auditorium;
    exports.AuditoriumType = AuditoriumType;
}