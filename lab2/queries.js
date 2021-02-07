const Sequelize = require('sequelize')
const models = require('./init_models');

getModel = (model)=>{
    if (model==='faculties')
        model = models.Faculty;
    else if (model==='pulpits')
        model = models.Pulpit;
    else if (model==='subjects')
        model = models.Subject;
    else if (model==='teachers')
        model = models.Teacher;
    else if (model==='auditoriumstypes')
        model = models.AuditoriumType;
    else if (model==='auditoriums')
        model = models.Auditorium;
    else
        return false
    return model;
}
selectAll = function (model){
    model = getModel(model);
    if (model!=false)
        return model.findAll()
    else 
        return new Promise((res,rej)=>rej({error:'epic feil!!^) no such table name'}))
    if (model==='faculties')
        model = models.Faculty;
    else if (model==='pulpits')
        model = models.Pulpit;
    else if (model==='subjects')
        model = models.Subject;
    else if (model==='teachers')
        model = models.Teacher;
    else if (model==='auditoriumstypes')
        model = models.AuditoriumType;
    else if (model==='auditoriums')
        model = models.Auditorium;
    else
        return new Promise((res,rej)=>rej({error:'epic feil!!^) no such table name'}))
    return model.findAll()
}

selectFacultiesJoin = (faculty, model)=>{
    if (model==='pulpits')
        model = models.Pulpit;
    else if (model==='teachers')
        model = models.Teacher;
    else
        return new Promise((res,rej)=>rej({error:'epic feil!!^) no such table name'}))
    return models.Faculty.findAll(
        {
            where:{faculty:faculty},
            include:[
                {model:model,required:true}
            ]
        }
    )
}

insert = (model,obj)=>{
    model = getModel(model);
    if (model!=false)
        return model.create(obj)
    else 
        return new Promise((res,rej)=>rej({error:'epic feil!!^) no such table name'}))
}

destroy = (model,value)=>{
    model = getModel(model);
    if (model!=false)
        return model.findOne({where:{[model.primaryKeyAttribute]:value}})
            .then(
                res=>{
                    if (res==null)
                        return new Promise((res,rej)=>rej({error:'no such row^('}))
                    return model.destroy({where:{[model.primaryKeyAttribute]:value}})
                        .then(result=>res)
                }
            )
    else 
        return new Promise((res,rej)=>rej({error:'epic feil!!^) no such table name'}))
}


update = (model,obj)=>{
    model = getModel(model);
    key = obj[model.primaryKeyAttribute]
    if (key==null || key==undefined){
        return new Promise((res,rej)=>rej({error:'i need pk!>:('}))
    }
    if (model!=false)
        return model.findOne({where:{[model.primaryKeyAttribute]:key}})
            .then(
                res=>{
                    if (res==null)
                        return new Promise((res,rej)=>rej({error:'no such row^('}))
                    return model.update(
                        obj,
                        {where:{[model.primaryKeyAttribute]:key}})
                        .then(result=>{
                            return model.findOne({where:{[model.primaryKeyAttribute]:key}})
                        })
                }
            )
    else 
        return new Promise((res,rej)=>rej({error:'epic feil!!^) no such table name'}))
}

auditoriumsgt60 = ()=>{
    return models.Auditorium.scope('auditoriumsgt60') 
        .findAll();
    return new Promise((res,rej)=>res({error:'epic feil!!^) no such table name'}))
    
}
// exports = main;
exports.selectAll = selectAll;
exports.selectFacultiesJoin = selectFacultiesJoin;
exports.insert = insert;
exports.destroy = destroy;
exports.update = update;
exports.auditoriumsgt60 = auditoriumsgt60;