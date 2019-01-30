'use strict'

const cors = require('cors');
const express = require('express');
const router = express.Router();

const bconst = require('../lib/bConstants');
const crud = require('../lib/bCrudlib');
const department = require('../lib/bUser').department;
const auth = require('../lib/bUtils').userAuth;


router.options("/*", cors(bconst.corsOptions));

// plan
router.post('/', cors(bconst.corsOptions), auth(), crud('department', department));

module.exports = router;