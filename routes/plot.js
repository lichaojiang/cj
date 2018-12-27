'use strict'

const express = require('express');
const router = express.Router();
const execSync = require('child_process').execSync;
const url = require('url');
const path = require('path');
const moment = require('moment');
const cors = require('cors');
const bconst = require('../lib/bConstants');
const bplot = require('../lib/bPlotlib');
const bres = require('../lib/bResponse');
const bUtil = require('../lib/bUtils');
const bach = require('../lib/bAnalysiscorestatus');
const bauth = require('../lib/bUtils').userAuth;


router.options("/*", cors(bconst.corsOptions)); 

/* POST users listing. */
router.post('/', cors(bconst.corsOptions), bauth(), function(req, res, next) {
	// 将url的query查询对象交给params保存
    const params = url.parse(req.url, true).query;
    //定义变量保存获得数据的接口 
    let api_get_data, cmdstr;
    let argv = [];
	switch(params.method)
	{
        case "line":
            //拿到数据
            api_get_data = path.join(bconst.exedir, "getDataByTime.py");
            cmdstr = bconst.statspython+" "+api_get_data+" "+params.start+" "+params.end+" "+
                params.type+" "+params.machine+" "+params.min+" "+params.max;
            //执行cmdstr
            console.log("cmd string is:" + cmdstr);
            argv = [req.body.xlabel, req.body.ylabel, req.body.title];
            bUtil.execute(res, cmdstr, bplot.plotLineNoX, argv);	
		    break;
        case "hist":
            api_get_data=path.join(bconst.exedir,"getDataByTime.py");
            cmdstr=bconst.statspython+" "+api_get_data+" "+params.start+" "+params.end+" "
                        +params.type+" "+params.machine+" "+params.min+" "+params.max;
            console.log("cmd string is :"+cmdstr);
            argv = [params.amount];
            bUtil.execute(res, cmdstr, bplot.plotHist, argv);
            break;
        case "any":
            // request body
            /*
            {
                "machine": "1",
                "interval_start":["2018-07-14 8:00:00", "2018-07-14 13:30:00"],
                "interval_end":["2018-07-14 12:00:00", "2018-07-14 17:30:00"],
                "days": 5,
                "title": "Efficiency",
                "xlabel": "Date",
                "ylabel": "Eff",
                "alias":["morning","afternoon"],
                "variables":"'throughput,elasped,setup,poweroff'",
                "recipe":"'throughput/(elasped-setup-poweroff)'",
                "getdata":["2018-07-14 00:00:00", "2018-08-30 00:00:00", "cycle"]
            }
            */

            let body = req.body;
            if (body.getdata !== null && typeof body.getdata != 'undefined') {
                let min = body.getdata[3] || 0;
                let max = body.getdata[4] || 1000000;
                lineMethod(req, res, body.getdata[0], body.getdata[1], body.getdata[2], body.machine, min, max)
            }
            else {
                let x = [];
                let y = [];

                // datetime formate
                const DTFORMAT = "YYYY-MM-DD kk:mm:ss"
                const XFORMAT = "MM-DD"
                let status = bres.status_OK;
                let isEmptyInterval = false;
                
                api_get_data = path.join(bconst.exedir, "magicbag.py");
                if (body.interval_start.length !== body.interval_end.length) {
                    status = bres.ERR_PLOT_INTERVAL;
                    bres.send(res, null, status);
                    return;
                }
                let interval_num = body.interval_start.length;
                for (let i=0; i<body.days; i++) {
                    for (let j=0; j<interval_num; j++) {
                        let start = moment(body.interval_start[j], DTFORMAT);
                        let end = moment(body.interval_end[j], DTFORMAT);

                        start.add(i, 'days');
                        end.add(i, 'days');

                        cmdstr = bconst.statspython+" "+api_get_data+" "+start.format(DTFORMAT)+" "+end.format(DTFORMAT)+" "+
                            body.machine+" "+body.variables+" "+body.recipe;
                        console.log("cmd string is:" + cmdstr);

                        let stdout = execSync(cmdstr);
                        let output = bUtil.parseStdout(stdout);
                        // no data or zero division
                        if (bach.isWARN_NO_DATA(output.status.errcode) ||
                            bach.isWARN_ZERODIVISION(output.status.errcode)) {
                            isEmptyInterval = true;
                            continue;
                        }
                        
                        x.push(start.format(XFORMAT)+" ("+body.alias[j]+")");
                        y.push(output.data); 
                    }
                }

                let plot = bplot.plotLineWithX(x, y, body.xlabel, body.ylabel, body.title);
                if (bach.isSTATUSOK(plot.errcode) && isEmptyInterval === true) {
                    status = bres.WARN_EMPTY_INTERVAL
                }
                else {
                    status = plot.status;
                }
                bres.send(res, plot.data, status);
            }
            break;
        default:
		    break;
	}
});

function lineMethod(req, res, start, end, type, machine, min="", max="") {
    let api_get_data = path.join(bconst.exedir, "getDataByTime.py");
    let cmdstr = bconst.statspython+" "+api_get_data+" "+start+" "+end+" "+
        type+" "+machine+" "+min+" "+max;
    let argv = [req.body.xlabel, req.body.ylabel, req.body.title];
    console.log("cmd string is:" + cmdstr);
    bUtil.execute(res, cmdstr, bplot.plotLineNoX, argv);
}

module.exports = router;