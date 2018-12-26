'use strict'

const cors = require('cors');
const express = require('express');
const router = express.Router();
const bconst = require('../lib/bConstants');
const bres = require('../lib/bResponse');
const bcrud = require('../lib/bCrudlib')
const plan = require('../lib/bProduction').plan;
const product = require('../lib/bProduction').product;
const group = require('../lib/bProduction').group;


router.options("/*", cors(bconst.corsOptions));

router.post('/plan', cors(bconst.corsOptions), bcrud({tableName: 'productionplan', tableClass: plan}));

router.get('/plan/status', (req, res, next) => {
    let data = {};
    data.planStatus = bconst.planStatus;
    data.showFields = bconst.planStatusShowFields_cn;
    bres.send(res, data, bres.status_OK);
})

router.post('/product', cors(bconst.corsOptions),bcrud({tableName: 'product', tableClass: product}));

router.post('/group', cors(bconst.corsOptions),bcrud({tableName: 'productgroup', tableClass: group}));

module.exports = router;