'use strict'

const cors = require('cors');
const express = require('express');
const router = express.Router();
const bProd = require('../lib/bProduction');
const bDb = require('../lib/bDatabaselib');
const bconst = require('../lib/bConstants');
const bres = require('../lib/bResponse');

router.options(" /*", cors(bconst.corsOptions));

/* POST users listing. */
router.post('/plan', cors(bconst.corsOptions), function(req, res, next) {
    let sqlObj = new bDb.sql(res);
    let planObj = new bProd.plan(sqlObj, "productionplan");
    let id;
    switch(req.body.method)
    {
        case "create":
            planObj.create(req.body.plan).then(() => {
                sqlObj.end();
            }).then(() => {
                bres.send(res, 'Plan created.', bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        case "read":
            let limit = req.body.plan.limit || 10;
            planObj.read(limit).then(() => {
                sqlObj.end()
            }).then(resolvedResults => {
                bres.send(res, resolvedResults, bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        case "update":
            id = req.body.plan.id;
            if (typeof id !== 'number') {
                bres.send(res, null, bres.ERR_SQL_ID);
            }
            else {
                let new_items = req.body.plan.new_items;
                planObj.update(id, new_items).then(() => {
                    sqlObj.end();
                }).then(() => {
                    bres.send(res, 'Plan updated.', bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    console.log(err + '\n' + JSON.stringify(err_status));
                    bres.send(res, null, err_status);
                });
            }
            break;
        case "delete":
            id = req.body.plan.id;
            if (typeof id !== 'number') {
                bres.send(res, null, bres.ERR_SQL_ID);
            }
            else {
                planObj.delete(id).then(() => {
                    sqlObj.end();
                }).then(() => {
                    bres.send(res, 'Plan deleted.', bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    console.log(err + '\n' + JSON.stringify(err_status));
                    bres.send(res, null, err_status);
                });
            }
            break;
        default:
		    break;
    }
});

module.exports = router;