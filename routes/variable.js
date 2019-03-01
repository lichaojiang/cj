'use strict'

const cors = require('cors');
const express = require('express');
const router = express.Router();

const bconst = require('../lib/bConstants');

const crud = require('../lib/bCrudlib');
const variable = require('../lib/bVariable').variable;
const auth = require('../lib/bUtils').userAuth;


router.options("/*", cors(bconst.corsOptions));

router.post('/variable',cors(bconst.corsOptions),auth(['analysis']),crud('variable_1',variable));

module.exports = router;