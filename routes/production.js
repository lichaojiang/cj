'use strict'

const cors = require('cors');
const router = require('express').router();
const {body} = require('express-validator/check');
const bProd = require('../lib/bProduction');
const bDb = require('../lib/bDatabaselib');
const bconst = require('../lib/bConstants');


router.options(" /*", cors(bconst.corsOptions));

/* POST users listing. */
router.post('/plan', cors(bconst.corsOptions), function(req, res, next) {
    let sqlObj = new bDb.sql(res);
    let planObj = new bProd.plan(sqlObj);
    switch(req.body.method)
    {
        case "create":
            let code = req.body.code || "";
            body(['quantity', 'begin', 'end', 'assignee', 'status'], 'Missing required fields.').not().isEmpty();
            
            let field_arr = []
            planObj.create(req.body.table, )
            break;
    }

    // IMPORTANT: end sql connection
    sqlObj.end();
});

module.exports = router;