'use strict'

const cors = require('cors');
const express = require('express');
const router = express.Router();
const bProd = require('../lib/bProduction');
const bDb = require('../lib/bDatabaselib');
const bconst = require('../lib/bConstants');
const bres = require('../lib/bResponse');

router.options("/*", cors(bconst.corsOptions));

router.post('/plan', cors(bconst.corsOptions), (req, res, next) => {
    let sqlObj = new bDb.sql(res);
    let planObj = new bProd.plan(sqlObj, "productionplan");
    switch(req.body.method)
    {
        case "create":
            planObj.create(req.body.query).then(() => {
                return sqlObj.end();
            }).then(() => {
                bres.send(res, 'Plan created.', bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        case "read":
            let limit = req.body.query.limit || 10;
            let page = req.body.query.page || 1;
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
            break;
        case "update":
            let id = req.body.query.id;
            if (typeof id !== 'number') {
                bres.send(res, null, bres.ERR_SQL_ID);
            }
            else {
                planObj.update(req.body.query).then(() => {
                    return sqlObj.end();
                }).then(() => {
                    bres.send(res, 'Plan updated.', bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    console.log(JSON.stringify(err_status) + '\n' + err.stack);
                    bres.send(res, null, err_status);
                });
            }
            break;
        case "delete":
            let id_arr = req.body.query.id;
            planObj.delete(id_arr).then(() => {
                return sqlObj.end();
            }).then(() => {
                bres.send(res, 'Plan deleted.', bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        default:
		    break;
    }
})

router.post('/product', cors(bconst.corsOptions), (req, res, next) => {
    let sqlObj = new bDb.sql(res);
    let productObj = new bProd.product(sqlObj, "product");
    switch(req.body.method)
    {
        case "create":
            productObj.create(req.body.query).then(() => {
                return sqlObj.end();
            }).then(() => {
                bres.send(res, 'product created.', bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        case "read":
            let limit = req.body.query.limit || 10;
            let page = req.body.query.page || 1;
            let results = {};
            productObj.read(limit, page).then((resolvedResults) => {
                results = resolvedResults;
                return sqlObj.end();
            }).then(() => {
                bres.send(res, results, bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        case "update":
            let id = req.body.query.id;
            if (typeof id !== 'number') {
                bres.send(res, null, bres.ERR_SQL_ID);
            }
            else {
                productObj.update(req.body.query).then(() => {
                    return sqlObj.end();
                }).then(() => {
                    bres.send(res, 'product updated.', bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    console.log(JSON.stringify(err_status) + '\n' + err.stack);
                    bres.send(res, null, err_status);
                });
            }
            break;
        case "delete":
            let id_arr = req.body.query.id;
            productObj.delete(id_arr).then(() => {
                return sqlObj.end();
            }).then(() => {
                bres.send(res, 'product deleted.', bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        default:
		    break;
    }
})

router.post('/group', cors(bconst.corsOptions), (req, res, next) => {
    let sqlObj = new bDb.sql(res);
    let groupObj = new bProd.group(sqlObj, "product");
    switch(req.body.method)
    {
        case "create":
            groupObj.create(req.body.query).then(() => {
                return sqlObj.end();
            }).then(() => {
                bres.send(res, 'group created.', bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        case "read":
            let limit = req.body.query.limit || 10;
            let page = req.body.query.page || 1;
            let results = {};
            groupObj.read(limit, page).then((resolvedResults) => {
                results = resolvedResults;
                return sqlObj.end();
            }).then(() => {
                bres.send(res, results, bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        case "update":
            let id = req.body.query.id;
            if (typeof id !== 'number') {
                bres.send(res, null, bres.ERR_SQL_ID);
            }
            else {
                groupObj.update(req.body.query).then(() => {
                    return sqlObj.end();
                }).then(() => {
                    bres.send(res, 'group updated.', bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    console.log(JSON.stringify(err_status) + '\n' + err.stack);
                    bres.send(res, null, err_status);
                });
            }
            break;
        case "delete":
            let id_arr = req.body.query.id;
            groupObj.delete(id_arr).then(() => {
                return sqlObj.end();
            }).then(() => {
                bres.send(res, 'group deleted.', bres.status_OK);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err + '\n' + JSON.stringify(err_status));
                bres.send(res, null, err_status);
            });
            break;
        default:
		    break;
    }
})

module.exports = router;