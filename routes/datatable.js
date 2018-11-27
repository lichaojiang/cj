'use strict'

var express = require('express');
var router = express.Router();
var exec = require('child_process').exec; 
var url = require('url');
const path = require('path');
const bconst = require('../lib/bConstants');
const butil = require('../lib/bUtils');
const bres = require('../lib/bResponse');

/* global var*/
//var exedir=(os.type()=="Windows_NT")?
//            "D:\\bivrost\\git\\BivBackend\\myapp\\EXE\\":"/var/BivBackend/myapp/EXE/";
router.options("/*", function(req, res, next){
    butil.crossDomain();
    res.send(200);
});

/* POST users listing. */
router.post('/', function(req, res, next) {
    butil.crossDomain();
    var params = url.parse(req.url, true).query;
    let cmdstr, api_bivstats, api_get_data;
	switch(params.method)
	{
        case "getStats":
            api_bivstats = path.join(bconst.exedir, "stats.py");
            cmdstr = bconst.statspython+" "+api_bivstats+" "+params.start+" "+params.end+" "+params.type+" "+params.machine;
            console.log("cmd string is:"+cmdstr);
            butil.execute(cmdstr, butil.parseStdout);
            break;
        case "getDataByTime":     
            api_get_data = path.join(bconst.exedir, "getDataByTime.py");
            cmdstr = bconst.statspython+" "+api_get_data+" "+params.start+" "+params.end+" "+params.type+" "+params.machine;					
            console.log("cmd string is:"+cmdstr);
            butil.execute(cmdstr, butil.parseStdout);                                       	    
			break;
        default:
			break;
	}
});

module.exports = router;