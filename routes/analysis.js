'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const bconst = require('../lib/bConstants');
const banalysis = require('../lib/bAnalysislib');
const bres = require('../lib/bResponse');
const bUtil = require('../lib/bUtils');
const auth = require('../lib/bUtils').userAuth;


router.options("/*", cors(bconst.corsOptions)); 

/* POST users listing. */
router.post('/', cors(bconst.corsOptions), auth(['analysis']), function(req, res, next) {
	// 将url的query查询对象交给params保存
    // const params = url.parse(req.url, true).query;
    //定义变量保存获得数据的接口 
    let api_analysis, cmdstr;
    let argv = [];
    if (typeof req.body.method === 'undefined')
        return bres.send(res, null, bres.ERR_BODY);
	switch(req.body.method)
	{
        case "line":
            //拿到数据
            api_analysis = path.join(bconst.exedir, "getDataByTime.py");
            cmdstr = bconst.statspython+" "+api_analysis+" "+req.body.start+" "+req.body.end+" "+
                req.body.type+" "+req.body.machine+" "+req.body.min+" "+req.body.max;
            //执行cmdstr
            console.log("cmd string is:" + cmdstr);

            // bUtil.execute(res, cmdstr, banalysis.analysisLineNoX, argv);	
            bUtil.execute(cmdstr, banalysis.analysisLineNoX).then(output => {
                bres.send(res, output.data, output.status);
            }).catch(err => {
                let err_status = bres.findStatus(err);
                console.log(err_status);
                console.log(err.stack);
                bres.send(res, data, err_status);
            });
		    break;
        case "hist":
            api_analysis = path.join(bconst.exedir,"getDataByTime.py");
            cmdstr=bconst.statspython+" "+api_analysis+" "+req.body.start+" "+req.body.end+" "
                        +req.body.type+" "+req.body.machine+" "+req.body.min+" "+req.body.max;
            console.log("cmd string is :"+cmdstr);
            argv = [req.body.bin];
            bUtil.execute(cmdstr, banalysis.analysisHist, argv).then(output => {
                bres.send(res, output.data, output.status); 
            }).catch(err =>{
                let err_status = bres.findStatus(err);
                console.log(err_status);
                console.log(err.stack);
                bres.send(res, data, err_status);
            });
            break;
        case "getdata":
            let missing_arr = [];
            if (typeof req.body.query.start === 'undefined')
                missing_arr.push('query.start')
            if (typeof req.body.query.end === 'undefined')
                missing_arr.push('query.end')
            if (typeof req.body.query.type === 'pace')
                missing_arr.push('query.pace')
            if (typeof req.body.query.machine === 'pace')
                missing_arr.push('query.pace')
            
            if (missing_arr.length > 0) {
                bres.send(res, missing_arr, bres.ERR_REQUIRED)
                return
            }

            // bad handling, need to improve
            if (req.body.query.type !== 'pace' & req.body.query.type !== 'cycle')
                return bres.send(res, 'Error in query.type', bres.ERROR)
                
            api_analysis = path.join(bconst.exedir, "getDataWithTime.py");

            let options = {};
            if (req.body.query.min)
                options.min = req.body.query.min
            if (req.body.query.max)
                options.max = req.body.query.max
            
            options = JSON.stringify(options);
            if (options === '{}') options = "";

            // python getDataWithTime.py "2018-7-16" "14:30:00" "2018-7-16" "15:00:00" "pace" "1"  "{'min': 0, 'max': 900}"
            // cmdstr = bconst.statspython+" "+api_analysis+" "+req.body.query.start+" "+req.body.query.end+" "+
            //    req.body.query.type+" "+req.body.query.machine+" "+options;
            cmdstr = `${bconst.statspython} ${api_analysis} ${req.body.query.start} ${req.body.query.end} ${req.body.query.type} ${req.body.query.machine} '${options}'`
            //执行cmdstr
            console.log("cmd string is:" + cmdstr);
            
            bUtil.execute(cmdstr, banalysis.getData).then(output => {
                bres.send(res, output.data, output.status);
            }).catch(err =>{
                let err_status = bres.findStatus(err);
                console.log(err_status);
                console.log(err.stack);
                bres.send(res, null, err_status);
            });
            break;
        case "any":
            if (typeof req.body.query === 'undefined')
                return bres.send(res, null, bres.ERR_BODY)

            let query = req.body.query;
            
            api_analysis = path.join(bconst.exedir, "magicbag.py");

            let dump_dir = path.join(bconst.dump_root, `${req.user.organization_id}`);
            if (!fs.existsSync(dump_dir)){
                fs.mkdirSync(dump_dir);
            }
            
            fs.access(dump_dir, async (err) => {
                if (err)
                    return await bres.throw(null, bres.ERROR);

                // python magicbag.py throughput,elasped,setup,poweroff throughput/(elasped-setup-poweroff) 1 2018-7-16 7 08:00:00-12:00:00,13:30:00-17:30:00 /dump_dir
                cmdstr = `${bconst.statspython} ${api_analysis} '${query.variables}' '${query.recipe}' ${query.machine} '${query.start_date}' ${query.days} '${query.intervals}' '${dump_dir}'`;
                console.log("cmd string is:" + cmdstr);

                try {
                    let output = await bUtil.execute(cmdstr, banalysis.analysisAny);
                    bres.send(res, output.data, output.status);    
                } catch (err) {
                    let err_status = bres.findStatus(err);
                    console.log(err_status);
                    console.log(err.stack);
                    bres.send(res, null, err_status);
                }
            })
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
    bUtil.execute(res, cmdstr, banalysis.analysisLineNoX, argv);
}

module.exports = router;