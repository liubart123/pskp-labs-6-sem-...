var express     = require('express');
var router      = express.Router();

const queries = require('./basiq_model_queries');
const model = require('./models');
const {Ability, AbilityBuilder, ForbiddenError, subject}=require('@casl/ability');


router.use(async function(req, res, next) { 
    const {rules,can,cannot}=new AbilityBuilder(Ability);

    const role = req.user.role;

    if (role==='guest'){
        can('read',['commit','repo'])
    }else if (role==='user'){
        can('read',['commit','repo'])
        can('read',['user'],{id:req.user.user_id})
        can('create',['repo'])
        can('update',['repo'],{authorId:req.user.user_id})
        can(['update','create'],['commit'],{authorId:req.user.user_id})
        // can('create',['commit'],{authorId:req.user.user_id})
    }else if (role==='admin'){
        can('read',['user'])
        can('manage',['commit','repo'])
    }

    req.ability = new Ability(rules);

    next();
});

router.use('/ability',(req,res)=>{
    res.status(200).send(req.ability.rules);
})

router.get('/user', async (req,res,next)=>{
    try{
        let users = await model.User().findAll({
            include:[{
                model:model.Repo(),
                as:'repos'
            }]
        })
        users=users.map(e=>{
            let {password, ...withouPass} = e.dataValues; 
            return withouPass;
        });
        for(let u of users){
            ForbiddenError.from(req.ability).throwUnlessCan('read', subject("user", u));
        }
        // req.ability.throwUnlessCan('read',users);
        res.json(users);
    }catch(e){
        next(e);
        //res.status(500).json(e);
    }
})
router.get('/user/:id', async (req,res,next)=>{
    try{
        let user = await model.User().findByPk(req.params.id);
        ForbiddenError.from(req.ability).throwUnlessCan('read', subject("user", user));
        // req.ability.throwUnlessCan('read',user);
        res.json(user);
    }catch(e){
        next(e);
    }
})

//REPS
router.get('/repos',async (req,res,next)=>{
    try{
        let repos= await model.Repo().findAll();
        for(let rep of repos){
            ForbiddenError.from(req.ability).throwUnlessCan('read', subject("repo", rep));
        }
        res.json(repos);
    }catch(e){
        next(e);
    }
})
router.get('/repos/:id',async (req,res,next)=>{
    try{
        let repo= await model.Repo().findByPk(req.params.id);
        ForbiddenError.from(req.ability).throwUnlessCan('read', subject("repo", repo));
        res.json(repo);
    }catch(e){
        next(e);
    }
})
router.post('/repos',async (req,res,next)=>{
    try{
        ForbiddenError.from(req.ability).throwUnlessCan('create', "repo");
        let repo = await model.Repo().create({
            name:req.fields.name,
            authorId:req.user.user_id
        });
        res.json(repo);
    }catch(e){
        next(e);
    }
})
router.put('/repos/:id',async (req,res,next)=>{
    try{
        let  repo = await model.Repo().findByPk(req.params.id);
        ForbiddenError.from(req.ability).throwUnlessCan('update', subject("repo",repo));
        repo = await model.Repo().update({
            name:req.fields.name
        },{where:{
            id:req.params.id
        }});
        res.json(repo);
    }catch(e){
        next(e);
    }
})
router.delete('/repos/:id',async (req,res,next)=>{
    try{
        let  repo = await model.Repo().findByPk(req.params.id);
        ForbiddenError.from(req.ability).throwUnlessCan('delete', subject("repo",repo));
        repo = await model.Repo().destroy({where:{
            id:req.params.id
        }});
        res.json(repo);
    }catch(e){
        next(e);
    }
})

//COMETS

router.get('/repos/:id/commits',async (req,res,next)=>{
    try{
        let commits = await model.Commit().findAll({where:{
            repoId:req.params.id
        }});
        for(let com of commits){
            ForbiddenError.from(req.ability).throwUnlessCan('read', subject("commit",com));
        }
        res.json(commits);
    }catch(e){
        next(e);
    }
})
router.get('/repos/:id/commits/:commitId',async (req,res,next)=>{
    try{
        let commit = await model.Commit().findOne({where:{
            repoId:req.params.id,
            id:req.params.commitId
        }});
        ForbiddenError.from(req.ability).throwUnlessCan('read', subject("commit",commit));
        res.json(commit);
    }catch(e){
        next(e);
    }
})
router.post('/repos/:id/commits',async (req,res,next)=>{
    try{
        let repo = await model.Repo().findByPk(req.params.id);
        ForbiddenError.from(req.ability).throwUnlessCan('create', subject("commit",{authorId:repo?repo.authorId:undefined}));
        let commit = await model.Commit().create({
            message:req.fields.message,
            repoId:req.params.id
        });
        res.json(commit);
    }catch(e){
        next(e);
    }
})
router.put('/repos/:id/commits/:commitId',async (req,res,next)=>{
    try{
        let repo = await model.Repo().findByPk(req.params.id);
        ForbiddenError.from(req.ability).throwUnlessCan('update', subject("commit",{authorId:repo?repo.authorId:undefined}));
        let commit = await model.Commit().update({
            message:req.fields.message
        }, {
            where:{
                id:req.params.commitId
            }
        });
        res.json(commit);
    }catch(e){
        next(e);
    }
})
router.delete('/repos/:id/commits/:commitId',async (req,res,next)=>{
    try{
        let repo = await model.Repo().findByPk(req.params.id);
        ForbiddenError.from(req.ability).throwUnlessCan('delete', subject("commit",{authorId:repo?repo.authorId:undefined}));
        let commit = await model.Commit().destroy({
            where:{
                id:req.params.commitId
            }
        });
        res.json(commit);
    }catch(e){
        next(e);
    }
})

router.use((err,req,res,next)=>{
    if (err instanceof ForbiddenError){
        res.status(403).json({message:'access denied. ' + err.message});
    }else {
        res.status(500).json({message:err.message});
    }
})

module.exports = router;