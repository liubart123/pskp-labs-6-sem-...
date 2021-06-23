
const express = require('express');
const router = express.Router();

const mockAPI = require('./api-mock');

class NotFoundError extends Error {
    constructor(message) {
      super(message || 'Cannot find resource by provided id');
      this.name = "NotFoundError";
      this.type = 'E_NOTFOUND'
    }
}

class ValidationError extends Error {
    constructor(message) {
      super(message || 'Provided parameter(s) has/have invalid value(s)');
      this.name = "ValidationError";
      this.type = 'E_VALIDATION'
    }
}

const GetError = (type, message) => {
    return {
        type: type,
        message: message
    }
}


router.get('/', (req, res, next) => {

    let page = Number.parseInt(req.query.page) - 1 || 0;

    page = page < 0? 0: page;

    let result = mockAPI.getPage(page);

    res.status(200).json(result);
})

const CheckTelephoneNumberFormatMiddleware = (req, res, next) => {
    if (mockAPI.checkNumberFormat(req.body)) {
        next();
    }
    else {
        
        let err = new ValidationError('Provided telephone number has invalid format');
        res.status(400).json({
            type: err.type,
            message: err.message
        });
    }
}

const CheckTelephoneNumberUniquenessMiddleware = (req, res, next) => {

    if (mockAPI.checkUniqueness(req.body)) {
        next();
    }
    else {
        let err = new ValidationError('Telephone number should be unique');
        res.status(400).json({
            type: err.type,
            message: err.message
        });
    }

}

const TelephoneNumberCheckMiddlewares = [CheckTelephoneNumberFormatMiddleware, CheckTelephoneNumberUniquenessMiddleware];


router.post('/', TelephoneNumberCheckMiddlewares, (req, res, next) => {

    let {number} = req.body;

    let createResult = mockAPI.create({
        number: number
    });

    res.status(201).json(createResult);
})

router.put('/', TelephoneNumberCheckMiddlewares, (req, res, next) => {

    let {id, number} = req.body;

    let updateResult = mockAPI.update({
        id: id,
        number: number
    })

    if (updateResult) {
        res.status(200).json(updateResult);
    }
    else {
        let err = new NotFoundError()
        res.status(404).json({
            type: err.type,
            message: err.message
        });
    }


    

})

router.delete('/:id', (req, res, next) => {

    let id = Number.parseInt(req.params.id);

    let delteResult = mockAPI.deleteById(id);

    if (delteResult) {
        res.status(204).send();
    }
    else{
        let err = new NotFoundError()
        res.status(404).json({
            type: err.type,
            message: err.message
        });
    }

})

module.exports = router;