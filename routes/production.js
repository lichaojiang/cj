'use strict'

const cors = require('cors');
const express = require('express');
const router = express.Router();

const bconst = require('../lib/bConstants');
const bres = require('../lib/bResponse');
const crud = require('../lib/bCrudlib');
const plan = require('../lib/bProduction').plan;
const product = require('../lib/bProduction').product;
const group = require('../lib/bProduction').group;
const auth = require('../lib/bUtils').userAuth;


router.options("/*", cors(bconst.corsOptions));

// plan
router.post('/plan', cors(bconst.corsOptions), auth(), crud({tableName: 'productionplan', tableClass: plan}));

router.get('/plan/status', auth(), (req, res, next) => {
    let data = {};
    data.planStatus = bconst.planStatus;
    data.showFields = bconst.planStatusShowFields_cn;
    bres.send(res, data, bres.status_OK);
})

// product
router.post('/product', cors(bconst.corsOptions), auth(), crud({tableName: 'product', tableClass: product}));

// group
router.post('/group', cors(bconst.corsOptions), auth(), crud({tableName: 'productgroup', tableClass: group}));

module.exports = router;