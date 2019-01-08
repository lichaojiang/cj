const express = require('express');
const router = express.Router();
const cors = require('cors');
const bconst = require('../lib/bConstants')

router.options("/*", cors(bconst.corsOptions)); 

/* GET home page. */
router.get('/bivcloud', cors(bconst.corsOptions), function(req, res, next) {
  //res.sendFile("/Users/Will/bivrost/BivBackend/myapp/public/apps/Bivcloud/index.html");
  res.sendFile(bconst.root + "/public/apps/Bivcloud/index.html");
  //res.render('index', { title: 'Express' });
});

module.exports = router;