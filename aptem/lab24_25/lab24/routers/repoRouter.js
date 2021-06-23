const express = require('express');

const router = express.Router();

const database = require('../database');

const {ForbiddenError, subject} = require('@casl/ability');

const {actions, subjects} = require('../authorization/constants.json');

const databaseHelper = require('../database-requests');
const NotFoundError = require('../NotFoundError');

router.get('/', (req, res, next) => {

    ForbiddenError.from(req.ability).throwUnlessCan(actions.read, subjects.Repo);

    database.models.Repo.findAll()
    .then(found => {

        // const usersWithoutPassword = found.map(user => {
        //     const {password, ...userWithoutPassword} = user.dataValues;
        //     return userWithoutPassword;
        // })
        res.json(found);
    })
})


/**
 * 
 * @param {number} id 
 * @summary Resolves found repo or creates response with 404 status code
 */
const findRepoById = (id, objectWithIncludeProperty = {}) => {

    return new Promise((resolve, reject) => {

        let {include, ...otherProperties } = objectWithIncludeProperty;

        //хоть какая-то защита (свойства внутри не проверяю)
        if (!Array.isArray(include)) {
            include = [];
        }

        database.models.Repo.findByPk(id, {
            rejectOnEmpty: new NotFoundError(`Repo with id ${id} does not exist`),//{name: 'NotFoundError', message: `Repo with id ${id} does not exist`},
            //include: objectWithIncludeProperty ? objectWithIncludeProperty.include : []
            include: include            
        })
        .then(found => {

            resolve(found);
        })
        //не внёс сюда полную обработку в случае, если не найдёт ничего, так как у меня в Promise'ах не только эта ошибка отлавливается, но и ForbiddenError, поэтому убирать нельзя
        .catch(err => reject(err))

    })
    
}


const findRepoByIdIncludingCommits = (id) => {

    return new Promise((resolve, reject) => {

        findRepoById(id, {
            include: [
                {
                    model: database.models.Commit,
                    as: 'Commits'
                }
            ]
        })
        .then(found => resolve(found))
        .catch(err => reject(err));

    })

}

router.get('/:id', (req, res, next) => {

    const id = Number.parseInt(req.params.id);

    findRepoById(id)
    .then(found => {
        ForbiddenError
            .from(req.ability)
            .setMessage(`Current user cannot watch this repo`)
            .throwUnlessCan(actions.read, found);//subject(subjects.Repo, {id: id}));
        
        // const {password, ...userWithoutPassword} = found.dataValues;
        res.json(found);
    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))
    
})

//TODO: должно ли быть редактируемым толкьо свойство name?
router.post('/', (req, res, next) => {

    ForbiddenError
        .from(req.ability)
        .setMessage(`Current user cannot create repo`)
        .throwUnlessCan(actions.create, subjects.Repo);

    const {name} = req.body;

    const authorId = req.user.id;

    database.models.Repo.create({
        name: name,
        authorId: authorId//...
    })
    .then(created => {
        res.json(created);
    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))

})

//обновлять должен только свойство name?
router.put('/:id', (req, res, next) => {

    //хоть можно было бы и не парсить, так как он сам преообразует значение внужный мне тип, но явно это сделал
    const id = Number.parseInt(req.params.id);

    const {name} = req.body;

    //теперь не нужно, так как не использую subject
    // const currentUserId = req.user.id;

    // ForbiddenError.from(req.ability).throwUnlessCan(actions.update, subject(subjects.Repo, {id: id, authorId: currentUserId}));


    findRepoById(id)
    .then(found => {

       //ForbiddenError.from(req.ability).throwUnlessCan(actions.read, found);//subject(subjects.Repo, {id: id}));
       ForbiddenError
            .from(req.ability)
            .setMessage(`Current user is not the creator of repo ${id}`)
            .throwUnlessCan(actions.update, found);//subject(subjects.Repo, {id: id, authorId: currentUserId}));
        
       found.update({
           name: name,
           //authorId: authorId
       })
       .then(updated => {
           res.json(updated);
       })
       .catch(err => {
           console.error(err)
       })

    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))

    
})

router.delete('/:id', (req, res, next) => {

    const id = Number.parseInt(req.params.id);


    findRepoById(id)
    .then(found => {

        ForbiddenError
            .from(req.ability)
            .setMessage(`Current user cannot delete repository with id ${id}`)
            .throwUnlessCan(actions.delete, found);//subject(subjects.Repo, {id: id}));

        found.destroy()
        .then(deleted => {
            res.status(204).send();
        })
        .catch(err => {
            console.error(err);
        })

    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))

    
})


router.get('/:id/commits', (req, res, next) => {

    const repoId = Number.parseInt(req.params.id);

    ForbiddenError
        .from(req.ability)
        .setMessage(`Current user cannot watch commits of repo with id ${repoId}`)
        .throwUnlessCan(actions.read, subjects.Commit);


    findRepoByIdIncludingCommits(repoId)
    .then(found => {

        res.json(found.Commits);

    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))

    
})

router.get('/:id/commits/:commitId', (req, res, next) => {

    const repoId = Number.parseInt(req.params.id);
    const commitId = Number.parseInt(req.params.commitId);

    ForbiddenError
        .from(req.ability)
        .setMessage(`Current user cannot watch commit with id ${commitId} from repo with id ${repoId}`)
        .throwUnlessCan(actions.read, subjects.Commit);

    findRepoByIdIncludingCommits(repoId)
    .then(found => {

        let foundCommit = found.Commits.find(commit => {
            return commit.id == commitId;
        });

        if (foundCommit) {
            res.json(foundCommit);
        }
        else {
            throw new NotFoundError(`Cannot find commit with id ${commitId} inside repo with id ${repoId}`);
            //throw new Error(`Cannot find commit with id ${commitId} inside repo with id ${repoId}`);
        }

        

    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))

})


router.post('/:id/commits', (req, res, next) => {

    const repoId = Number.parseInt(req.params.id);

    //let result = req.ability.can('create', subject('Commit', {repoId: repoId}));


    const {message} = req.body;


    findRepoById(repoId)
    .then(found => {

        ForbiddenError
            .from(req.ability)
            .setMessage(`Current user cannot create commits to repo with id ${repoId}`)
            .throwUnlessCan(actions.create, subject(subjects.Commit, {repoId: repoId}));

        database.models.Commit.create({
            message: message,
            repoId: repoId
        })
        .then(created => {
            
            res.json(created);
        })
        .catch(err => {
            console.error(err);
        })

    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))

    
    

})

router.put('/:id/commits/:commitId', (req, res, next) => {

    const repoId = Number.parseInt(req.params.id);
    const commitId = Number.parseInt(req.params.commitId);

    

    const {message} = req.body;



    findRepoByIdIncludingCommits(repoId)
    .then(found => {

        let foundCommit = found.Commits.find(commit => {
            return commit.id == commitId;
        });

        if (foundCommit) {

            //так как создавать commit'ы к репозиториям может только создательно репозитория, то и проверять, являтся ли данный пользователь создателем commit'а не надо
            ForbiddenError
                .from(req.ability)
                .setMessage(`Current user cannot update commit with id ${commitId} from repo with id ${repoId}`)
                .throwUnlessCan(actions.update, foundCommit);//subject(subjects.Commit, {repoId: repoId}));

            foundCommit.update({
                message: message
            })
            .then(updated => {
                res.json(updated);
            })
            .catch(err => {
                console.error(err);
            })
        
        }
        else {
            throw new NotFoundError(`Cannot find commit with id ${commitId} inside repo with id ${repoId}`);
            //throw new Error(`Cannot find commit with id ${commitId} inside repo with id ${repoId}`);
        }

        

    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))

})

router.delete('/:id/commits/:commitId', (req, res, next) => {

    const repoId = Number.parseInt(req.params.id);
    const commitId = Number.parseInt(req.params.commitId);


    findRepoByIdIncludingCommits(repoId)
    .then(found => {

        let foundCommit = found.Commits.find(commit => {
            return commit.id == commitId;
        });

        if (foundCommit) {

            ForbiddenError
                .from(req.ability)
                .setMessage(`Current user cannot delete commit with id ${commitId} from repo with id ${repoId}`)
                .throwUnlessCan(actions.delete, foundCommit);//subject(subjects.Commit, {repoId: repoId}));

            foundCommit.destroy()
            .then(deleted => {
                res.status(204).send();
                //res.json(updated);
            })
            .catch(err => {
                console.error(err);
            })
        
        }
        else {
            throw new NotFoundError(`Cannot find commit with id ${commitId} inside repo with id ${repoId}`);
            //throw new Error(`Cannot find commit with id ${commitId} inside repo with id ${repoId}`);
        }

        

    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))



    // database.models.Commit.findOne({
    //     where: {
    //         id: commitId,
    //         repoId: repoId
    //     }
    // })
    // .then(found => {
    //     //res.json(found);

    //     found.destroy({
            
    //     })
    //     .then(deleted => {
    //         res.json(deleted);
    //     })


    // })

})


module.exports = router;