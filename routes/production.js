'use strict'

const cors = require('cors');
const express = require('express');
const router = express.Router();
const bProd = require('../lib/bProduction');
const bDb = require('../lib/bDatabaselib');
const bconst = require('../lib/bConstants');
const bres = require('../lib/bResponse');

router.options("/*", cors(bconst.corsOptions));

router.post('/plan/create', cors(bconst.corsOptions), (req, res, next) => {
    let sqlObj = new bDb.sql(res);
    let planObj = new bProd.plan(sqlObj, "productionplan");
    planObj.create(req.body.plan).then(() => {
        return sqlObj.end();
    }).then(() => {
        bres.send(res, 'Plan created.', bres.status_OK);
    }).catch(err => {
        let err_status = bres.findStatus(err);
        console.log(err + '\n' + JSON.stringify(err_status));
        bres.send(res, null, err_status);
    });
})

router.get('/plan/read', cors(bconst.corsOptions), (req, res, next) => {
    let sqlObj = new bDb.sql(res);
    let planObj = new bProd.plan(sqlObj, "productionplan");
    let limit = req.body.plan.limit || 10;
    let page = req.body.plan.page || 1;
    let results = {};
    planObj.read(limit, page).then((resolvedResults) => {
        results = resolvedResults;
        return sqlObj.end();
    }).then(() => {
        bres.send(res, results, bres.status_OK);
    }).catch(err => {
        let err_status = bres.findStatus(err);
        console.log(err + '\n' + JSON.stringify(err_status));
        bres.send(res, null, err_status);
    });
})

router.post('/plan/update', cors(bconst.corsOptions), (req, res, next) => {
    let sqlObj = new bDb.sql(res);
    let planObj = new bProd.plan(sqlObj, "productionplan");
    let id = req.body.plan.id;
    if (typeof id !== 'number') {
        bres.send(res, null, bres.ERR_SQL_ID);
    }
    else {
        planObj.update(req.body.plan).then(() => {
            return sqlObj.end();
        }).then(() => {
            bres.send(res, 'Plan updated.', bres.status_OK);
        }).catch(err => {
            let err_status = bres.findStatus(err);
            console.log(JSON.stringify(err_status) + '\n' + err.stack);
            bres.send(res, null, err_status);
        });
    }
})

router.post('/plan/delete', cors(bconst.corsOptions), (req, res, next) => {
    let sqlObj = new bDb.sql(res);
    let planObj = new bProd.plan(sqlObj, "productionplan");
    let id_arr = req.body.plan.id;
    planObj.delete(id_arr).then(() => {
        return sqlObj.end();
    }).then(() => {
        bres.send(res, 'Plan deleted.', bres.status_OK);
    }).catch(err => {
        let err_status = bres.findStatus(err);
        console.log(err + '\n' + JSON.stringify(err_status));
        bres.send(res, null, err_status);
    });
})

module.exports = router;