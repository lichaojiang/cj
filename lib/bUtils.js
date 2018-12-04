'use strict'
var exec = require('child_process').exec; 
const bres = require('./bResponse');
const bCorestatus = require('./bAnalysiscorestatus');

function infoValidator(infoObj)
{
    if (infoObj.errcode <= -20000)
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
    // output.status = {'errcode': infoObj.errcode, 'description': infoObj.description};
    if (bCorestatus.isSTATUSOK(infoObj.errcode)) 
        output.status = bres.status_OK;
    else if (bCorestatus.isWARN_NO_DATA(infoObj.errcode))
        output.status = bres.WARN_NO_DATA;
    else if (bCorestatus.isWarn(infoObj.errcode))
        output.status = bres.WARN_CORE;
    else if (bCorestatus.isError(infoObj.errcode))
        output.status = bres.ERR_CORE;
    else
        throw Error('Unknown errcode');
    
    return output;
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
        if (status.errcode === 'undefined' || status.description === 'undefined') {
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