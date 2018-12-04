'use strict'

var express = require('express');
var router = express.Router();
var exec = require('child_process').exec; 
var url = require('url');
const path = require('path');
const cors = require('cors');
const butil = require('../lib/bUtils');
const bconst = require('../lib/bConstants');

/* global var*/
//var exedir=(os.type()=="Windows_NT")?
//            "D:\\bivrost\\git\\BivBackend\\myapp\\EXE\\":"/var/BivBackend/myapp/EXE/";
router.options(" /*", cors(bconst.corsOptions)); 

/* POST users listing. */
router.post('/', cors(bconst.corsOptions), function(req, res, next) {
    var params = url.parse(req.url, true).query;
    let cmdstr, api_bivstats, api_get_data;
	switch(params.method)
	{
        case "getStats":
            api_bivstats = path.join(bconst.exedir, "stats.py");
            cmdstr = bconst.statspython+" "+api_bivstats+" "+params.start+" "+params.end+" "+params.type+" "+params.machine;
            console.log("cmd string is:"+cmdstr);
            butil.execute(res, cmdstr, butil.parseStdout);
            break;
        case "getDataByTime":     
            api_get_data = path.join(bconst.exedir, "getDataByTime.py");
            cmdstr = bconst.statspython+" "+api_get_data+" "+params.start+" "+params.end+" "+params.type+" "+params.machine;					
            console.log("cmd string is:"+cmdstr);
            butil.execute(res, cmdstr, butil.parseStdout);                                       	    
			break;
        default:
			break;
	}
});

module.exports = router;