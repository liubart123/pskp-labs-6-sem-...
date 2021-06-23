//contains basic CRUD operations realization 
// const Sequelize = require('sequelize')
const models = require('./models');

incorrectModelNameRejection = new Promise((res,rej)=>rej({error:'no such table name'}));
notFoundById = new Promise((res,rej)=>rej({error:'no elemnt with such id'}));

getModel = (model)=>{
    if (model==='User')
        model = models.User();
    else if (model === 'Repo')
        model = models.Repo();
    else if (model === 'Commit')
        model = models.Commit();
    else
        return false
    return model;
}
selectAll = function (model){
    model = getModel(model);
    if (model!=false)
        return model.findAll()
    else 
        return incorrectModelNameRejection
}

insert = (model,obj)=>{
    model = getModel(model);
    if (model!=false)
        return model.create(obj)
    else 
        return incorrectModelNameRejection
}

destroy = (model,value)=>{
    model = getModel(model);
    if (model!=false)
        return model.findOne({where:{[model.primaryKeyAttribute]:value}})
            .then(
                res=>{
                    if (res==null)
                        return notFoundById
                    return model.destroy({where:{[model.primaryKeyAttribute]:value}})
                        .then(result=>res)
                }
            )
    else 
        return incorrectModelNameRejection
}

selectOne = (model,value)=>{
    model = getModel(model);
    if (model!=false)
        return model.findOne({where:{[model.primaryKeyAttribute]:value}})
            // .then(
            //     res=>{
            //         return res;
            //     }
            // )
    else 
        return incorrectModelNameRejection
}

selectOneByColumn = (model,value, columnName)=>{
    model = getModel(model);
    if (model!=false)
        return model.findOne({where:{[columnName]:value}})
            // .then(
            //     res=>{
            //         return res;
            //     }
            // )
    else 
        return incorrectModelNameRejection
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
                        return notFoundById
                    return model.update(
                        obj,
                        {where:{[model.primaryKeyAttribute]:key}})
                        .then(result=>{
                            return model.findOne({where:{[model.primaryKeyAttribute]:key}})
                        })
                }
            )
    else 
        return incorrectModelNameRejection
}

exports.selectAll = selectAll;
exports.insert = insert;
exports.destroy = destroy;
exports.update = update;
exports.selectOne = selectOne;
exports.selectOneByColumn = selectOneByColumn;