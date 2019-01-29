'use strict'

const cors = require('cors');
const express = require('express');
const router = express.Router();

const bconst = require('../lib/bConstants');
const crud = require('../lib/bCrudlib');
const role = require('../lib/bUser').role;
const auth = require('../lib/bUtils').userAuth;


router.options("/*", cors(bconst.corsOptions));

// plan
router.post('/', cors(bconst.corsOptions), auth(['user']), crud('role', role));

module.exports = router;