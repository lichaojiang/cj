const express = require('express');
const router = express.Router(); 
const cors = require('cors');

const bconst = require('../lib/bConstants');
const bres = require('../lib/bResponse');

const auth = require('../lib/bUtils').userAuth;

router.options("/*", cors(bconst.corsOptions));

router.get('/fields', auth(), (req, res, next) => {
    bres.send(res, bconst.fixed_fields, bres.status_OK);
})

module.exports = router;