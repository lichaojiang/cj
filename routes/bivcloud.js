const express = require('express');
const router = express.Router();
const path = require('path');
const bconst = require('../lib/bConstants')

/* GET home page. */
router.get('/bivcloud', function(req, res, next) {
  //res.sendFile("/Users/Will/bivrost/BivBackend/myapp/public/apps/Bivcloud/index.html");
  res.sendFile(bconst.myappdir + "/public/apps/Bivcloud/index.html");
  //res.render('index', { title: 'Express' });
});

module.exports = router;