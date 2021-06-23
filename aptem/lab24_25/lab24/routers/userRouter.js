const express = require('express');

const router = express.Router();

const database = require('../database');

const databaseHelper = require('../database-requests');


const {ForbiddenError, subject} = require('@casl/ability');

const {actions, subjects} = require('../authorization/constants.json');

const NotFoundError = require('../NotFoundError');

router.get('/', (req, res ,next) => {

    //вариант с проверкой ползователя через can('read', 'User') не будет работать,
    //так как у обычных пользователей уже предопределена возможность читать пользователя с их id
    //(уже есть хотя бы 1 на которого распространяется привилегия, значит, будет возвращать true)
    //https://casl.js.org/v5/en/guide/intro#checking-logic
    //But CASL is different! It allows us to ask different questions to our permissions. So, when you check on a
    //subject, you ask "can I read THIS article?"
    //subject type, you ask "can I read SOME article?" (i.e., at least one article)

    ForbiddenError
        .from(req.ability)
        .setMessage(`Current user cannot watch profiles of others users`)
        //.throwUnlessCan(actions.read, 'all');
        .throwUnlessCan('manage', subjects.User);

    database.models.User.findAll()
    .then(found => {

        const usersWithoutPassword = found.map(user => {
            const {password, ...userWithoutPassword} = user.dataValues;
            return userWithoutPassword;
        })
        
        res.json(usersWithoutPassword);
    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))
})

router.get('/:id', (req, res, next) => {
    const id = Number.parseInt(req.params.id);
    
    database.models.User.findByPk(id, {
        rejectOnEmpty: new NotFoundError(`User with id ${id} does not exist`)//{name: 'NotFoundError', message: `User with id ${id} does not exist`}
    })
    .then(found => {

        const {password, ...userWithoutPassword} = found.dataValues;
        
        //{"message":"Cannot execute \"read\" on \"User\""}, значит, нормально распознал имя модели и связал с subject'ом
        ForbiddenError
            .from(req.ability)
            .setMessage(`Current user cannot watch different profile`)
            .throwUnlessCan(actions.read, found);

        res.json(userWithoutPassword);
    })
    .catch(err => databaseHelper.databaseErrorHandler(err, res, next))
})

module.exports = router;