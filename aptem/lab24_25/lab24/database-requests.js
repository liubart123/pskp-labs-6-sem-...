
const database = require('./database');

const {ForbiddenError} = require('@casl/ability');

module.exports = {
    getUserRepos: (userId) => {

        return new Promise((resolve, reject) => {
            database.models.Repo.findAll({
                where: {
                    authorId: userId
                }
            })
            .then(found => {
                resolve(found);
            })
            .catch(err=> {
                reject(err);
            })
        })

       
    },
    databaseErrorHandler: (err, response, next) => {

        next(err);
        
        
        // if (err instanceof ForbiddenError) {
        //     response.status(403);
        // }
        // else if (err.name == 'NotFoundError') {
        //     response.status(404);
        // }
        // else {
        //     response.status(500);
        // }

        // response.json({message: err.message});
        //(node:4216) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch 
        //block, or by rejecting a promise which was not handled with .catch().
        //throw new NotFoundError(`User with id ${id} does not exist`)
    }
}