const express = require('express');
const router = express.Router(); 
const cors = require('cors');

const bconst = require('../lib/bConstants');
const chartdata = require('../lib/bUser').chartData;
const crud = require('../lib/bCrudlib');
const auth = require('../lib/bUtils').userAuth;

router.options("/*", cors(bconst.corsOptions)); 

// user route
router.post('/', cors(bconst.corsOptions), auth(), crud('chartdata', chartdata));

module.exports = router;
