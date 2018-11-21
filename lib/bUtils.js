'use strict'

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