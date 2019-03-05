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
exports.execute = async (cmdstr, callback, argv=[]) => {
    return new Promise((resolve, reject) => {
        exec(cmdstr, async function(err, stdout, stderr) {
            if(err){
                if (err.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER')
                    return await bres.throw(reject, bres.ERR_MAX_BUFFER)
                console.log("python script running error:"+stderr);
                await bres.throw(reject, bres.ERROR);
            }
            else {
                let output;
                if (argv.length === 0)
                    output = callback(stdout);
                else
                    output = callback(stdout, argv);
                resolve(output);
            }
        });
    })
}

exports.userAuth = (privilege_arr) => {
    return async (req, res, next) => {
        if (req.isAuthenticated()) {
            if (!privilege_arr) {
                return next()
            }

            // check if user has privilege
            if (req.user.privilege.length > 0) {
                for (let privilege_i of req.user.privilege) {
                    // admin has all privilege
                    if (privilege_i == 'admin')
                        return next()
                    else if (privilege_arr.includes(privilege_i))
                        return next()
                }
                // res.status(401).send('No access right.');
                try {
                    await bres.throw(null, bres.ERR_ACCESS_DENIED)
                } catch (error) {
                    return next(error);   
                }
            }
            else {
                return next()
            }
        }
        else {
            res.redirect('/user/failure');
        }
    }
}
