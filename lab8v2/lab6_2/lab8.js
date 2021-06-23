var express     = require('express');
var router      = express.Router();

const model = require('./basiq_model_queries');

router.use(function(req, res, next) { 
    next();
});

module.exports = router;