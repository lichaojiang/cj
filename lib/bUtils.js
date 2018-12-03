'use strict'
var exec = require('child_process').exec; 
const bres = require('./bResponse');

function infoValidator(infoObj)
{
    if (infoObj.code <= -20000)
    {
        throw Error(infoObj.description);
    }
}

// return data from stdout
exports.parseStdout = (stdout) =>
{
    let infoObj = JSON.parse(stdout);
    infoValidator(infoObj); 

    let output = {};
    // set data
    output.data = infoObj.data;
    // set status
    output.status = {'code': infoObj.code, 'description': infoObj.description};
    
    return output;
}

//deal with crossDomain
exports.crossDomain = (req, res) => {
    let originList=[
        "http://www.bivrost.cn",
        "http://admin.bivrost.cn",
        "http://127.0.0.1",
        "http://localhost",
        "http://localhost:9528"
    ]
    if(originList.includes(req.headers.origin.toLowerCase()))
    {
        res.header("Access-Control-Allow-Origin",req.headers.origin);
    }
    res.header("Access-Control-Allow-Headers", "X-Requested-With,x-token");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
}

//child_process
exports.execute = (res, cmdstr, callback, argv=[]) => {
    exec(cmdstr, function(err, stdout, stderr) {
        if(err){
            console.log("python script running error:"+stderr);
            bres.send(res, stderr, bres.ERROR);
            return;
        }
        else {
            let output;
            if (argv.length === 0)
                output = callback(stdout);
            else
                output = callback(stdout, argv);
            bres.send(res, output.data, output.status);
        }
    });		
}

class errHandler {
    constructor (res) {
        this.res = res;
    }

    catch(err, status) {
        let isErr = false;
        if (status.code === 'undefined' || status.description === 'undefined') {
            throw Error('Error: expect bResponse status');        
        }
        if (err) {
            isErr = true;
            console.log(status.description);
            bres.send(this.res, null, status);
        }    
        return isErr
    }
}

exports.errHandler = errHandler;
    