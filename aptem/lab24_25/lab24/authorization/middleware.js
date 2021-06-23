

const jwt = require('jsonwebtoken');

const secretKey = require('../jwt.json')["secret-key"];


const {Ability, AbilityBuilder} = require('@casl/ability');

const databaseSERvice = require('../database-requests');


const caslConstants = require('./constants.json');
// {
//     subjects: {
//         User: 'User',
//         Commit: 'Commit',
//         Repo: 'Repo'
//     },
//     actions: {
//         read: 'read',
//         create: 'create',
//         update: 'update',
//         delete: 'delete'
//     }
// }


const expressJWT = require('express-jwt');

const ACCESS_TOKEN_NAME = require('../jwt.json')["access-token"];

const authenticationMiddleware = expressJWT({
    secret: secretKey,
    credentialsRequired: false,
    algorithms: ['HS256'],
    getToken: (req) => {

        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        }
        else if (req.query && req.query.token) {
            return req.query.token;
        }
        else if (req.signedCookies[ACCESS_TOKEN_NAME]) {
            return req.signedCookies[ACCESS_TOKEN_NAME];
        }
        else {
            //не генерирую токен, так как лишняя нагрузка, поэтому GUEST реально гость, который никак не ассоциирован с приложением
            return null;
        }
        
    }
})
//теперь в этом нет смысла, так как перенёс этот middleware и для определения прав на '/api/*'
//.unless({path: ['/login', '/signin', '/logout']})


const middleware = 
/**
 * @param {Request} req
 * @param {Response} res
 */
async (req, res, next) => {

    //AbilityBuilder class
    //This class implements can and cannot functions, that makes possible to write rules using DSL syntax.
    //This is the recommended way to define rules using DSL syntax

    //For more advanced cases, it's possible to use rules property of AbilityBuilder and create Ability instance manually
    let {can, cannot, rules} = new AbilityBuilder();


    const subjects = caslConstants.subjects;
    const actions = caslConstants.actions;


    can(actions.read, [subjects.Repo, subjects.Commit]);

    
    //express-jwt сформирует по возможности
    let user = req.user;

    if (user) {

        let userReposIds = (await databaseSERvice.getUserRepos(user.id)).map(repo => {
            return repo.id;
        });
        
        if (user.role == 'user') {

            can(actions.read, subjects.User, {id: user.id});
            can(actions.create, subjects.Repo);

            

            //здесь нужно проверятЬ, чтобы repoId был одним из рпозиториев, котоыре были созданы данным пользователем
            can([actions.create, actions.update], subjects.Commit, {repoId: {$in: userReposIds}});

            can(actions.update, subjects.Repo, {authorId: user.id});
        }
        else if (user.role == 'admin') {

            //если использовать manage all, то будет ошибка,Которая позволяет пользователю создавать коммиты в чужих репозиториях, а в задании такого не было
            //поэтому можно сделать cannot
            //cannot и manage all чуть больше возвожностей показывают
            //или же монжо просто задать много привилегий по каждому описанному пункту
            can('manage', 'all');
            
            //When defining direct and inverted rules for the same pair of action and subject the order of rules matters:
            //cannot declarations should follow after can, otherwise they will be overridden by can.
            cannot(actions.create, subjects.Commit, {repoId: {$nin: userReposIds}})
            //там, где проверяю, переопределяю сообщени, поэтому особого смысла в том, чтобы задавать его здесь, нет
            .because(`Only owner of repository can CREATE commits to it`);

            //такого нет
            //cannot('delete', 'User', {id: {$ne: user.id}});
        }
        
    }

    
    //удобно его записать в запрос (как было в лекции), так как его нужно будет потом предавать в другие router'ы, а в явном виде это номрально сделть нге льзя
    req.ability = new Ability(rules);


    req.user = user;

    next();
}


module.exports = [authenticationMiddleware, middleware];