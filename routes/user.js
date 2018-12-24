const express = require('express');
const router = express.Router(); 
const cors = require('cors');

const bconst = require('../lib/bConstants');
const buser = require('../lib/bUser');
const bcrud = require('../lib/bCrudlib')

router.options("/*", cors(bconst.corsOptions)); 

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/', cors(bconst.corsOptions), bcrud({tableName: 'user', tableClass: buser}));

module.exports = router;
