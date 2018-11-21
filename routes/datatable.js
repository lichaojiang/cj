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
     var orginList=[
         "http://www.bivrost.cn",
         "http://admin.bivrost.cn",
         "http://127.0.0.1",
         "http://localhost",
		 "http://localhost:9528"
     ]
     if(orginList.includes(req.headers.origin.toLowerCase())){
        
         res.header("Access-Control-Allow-Origin",req.headers.origin);
     }
	//res.header("Access-Control-Allow-Origin","*:*");
    res.header('Access-Control-Allow-Methods', "PUT,POST,GET,DELETE,OPTIONS");
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With,x-token');
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    res.send(200);
});

/* POST users listing. */
router.post('/', function(req, res, next) {
	var orginList=[
        "http://www.bivrost.cn",
        "http://admin.bivrost.cn",
        "http://127.0.0.1",
        "http://localhost",
		"http://localhost:9528"
    ]
    if(orginList.includes(req.headers.origin.toLowerCase()))
	{
        //
		res.header("Access-Control-Allow-Origin",req.headers.origin);
	}
    res.header("Access-Control-Allow-Headers", "X-Requested-With,x-token");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
	
    var params = url.parse(req.url, true).query;
    let cmdstr, api_bivstats;
	switch(params.method)
	{
        case "getStats":
            api_bivstats = path.join(bconst.exedir, "stats.py");
            cmdstr = bconst.statspython+" "+api_bivstats+" "+params.start+" "+params.end+" "+params.type+" "+params.machine;
			console.log("cmd string is:"+cmdstr);
			exec(cmdstr,function(err,stdout,stderr) {
                if(err){
                    console.log("python script running error:"+stderr);
                    bres.send(res, stderr, bres.ERROR);
                    return;
                }
                else
                {
                    let output = butil.parseStdout(stdout);
                    bres.send(res, output.data, output.status);
                }
		    });		
			break;
        case "getDataByTime":
            api_get_data = path.join(bconst.exedir, "getDataByTime.py");
            cmdstr = bconst.statspython+" "+api_get_data+" "+params.start+" "+params.end+" "+params.type+" "+params.machine;					
			console.log("cmd string is:"+cmdstr);
            exec(cmdstr,function(err,stdout,stderr) {
                if(err){
                    console.log("python script running error:"+stderr);
                    bres.send(res, stderr, bres.ERROR);
                    return;
                }
                else
                {
                    let output = butil.parseStdout(stdout);
                    bres.send(res, output.data, output.status);
                }
		    });	                                                               	    
			break;
        default:
			break;
	}
});

module.exports = router;