'use strict'

var express = require('express');
var router = express.Router();
var url = require('url');
const path = require('path');
const cors = require('cors');
const butil = require('../lib/bUtils');
const bconst = require('../lib/bConstants');
const auth = require('../lib/bUtils').userAuth;
const bres = require('../lib/bResponse');

/* global var*/
//var exedir=(os.type()=="Windows_NT")?
//            "D:\\bivrost\\git\\BivBackend\\myapp\\EXE\\":"/var/BivBackend/myapp/EXE/";
router.options("/*", cors(bconst.corsOptions)); 

/* POST users listing. */
router.get('/', cors(bconst.corsOptions), auth(), function(req, res, next) {
    var params = url.parse(req.url, true).query;
    let cmdstr, api_bivstats, api_get_data;
	switch(params.method)
	{
        case "getStats":
            api_bivstats = path.join(bconst.exedir, "stats.py");
            cmdstr = bconst.statspython+" "+api_bivstats+" "+params.start+" "+params.end+" "+params.type+" "+params.machine;
            console.log("cmd string is:"+cmdstr);
            butil.execute(cmdstr, butil.parseStdout).then(output => {
                bres.send(res, output.data, output.status);
            }).catch(err =>{
                let err_status = bres.findStatus(err);
                console.log(err_status);
                console.log(err.stack);
                bres.send(res, null, err_status);
            });;
            break;
        case "getDataByTime":     
            api_get_data = path.join(bconst.exedir, "getDataByTime.py");
            cmdstr = bconst.statspython+" "+api_get_data+" "+params.start+" "+params.end+" "+params.type+" "+params.machine;					
            console.log("cmd string is:"+cmdstr);
            butil.execute(cmdstr, butil.parseStdout).then(output => {
                bres.send(res, output.data, output.status);
            }).catch(err =>{
                let err_status = bres.findStatus(err);
                console.log(err_status);
                console.log(err.stack);
                bres.send(res, null, err_status);
            });;                                       	    
			break;
        default:
			break;
	}
});

module.exports = router;