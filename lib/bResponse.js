'use strict'

exports.status_OK = {"returncode": 200, "errcode": 0, "description":"ok"}
//##################################################
//#                   WARNING                      #
//##################################################
//# cannot find data in database
exports.WARN_NO_DATA = {"returncode": 204, "errcode":-10001, "description":"No data found with current selection."}

exports.WARN_EMPTY_INTERVAL = {"returncode": 204, "errcode": -10101, "description":"Warn: One or more intervals unavailable."}


//##################################################
//#                    ERROR                       #
//##################################################
exports.ERROR = {"returncode": 500, "errcode": -20000, "description": "Exception raised"}
exports.ERR_ARGUMENTS = {"returncode": 400, "errcode":-20001, "description":"Error: Wrong arguments."}
exports.ERR_WRITEFILE = {"returncode": 400, "description":"Error: Cannot write to file."}

exports.ERR_PLOT = {"returncode": 500, "errcode":-20100, "description":"Error: plot error."}
exports.ERR_PLOT_INTERVAL = {"returncode": 400, "errcode":-20101, "description":"Error: Expect interval_start.length == interval_end.length."}
exports.ERR_AMOUNT_NULL = {"returncode": 400, "errcode":-20102, "description":"Error: Histogram bin amount must be specified, and more than 0."}

exports.ERR_SQL = {"returncode": 500, "errcode":-20200, "description":"Error: SQL error."}
exports.ERR_SQL_QUERY = {"returncode": 400, "errcode":-20201, "description":"Error: Failed to query database."}
exports.ERR_SQL_CONNETION = {"returncode": 400, "errcode":-20202, "description":"Error: Failed to connect database."}
exports.ERR_SQL_RELEASE = {"returncode": 400, "errcode":-20203, "description":"Error: Failed to release pooling connection."}
exports.ERR_SQL_END = {"returncode": 400, "errcode":-20204, "description":"Error: Failed to end connection."}

exports.setup = (data, status) => {
    if (typeof(data) !== 'object') throw Error('Expect data to be an object')
    let res = {};
    res.data = data;
    res.errcode = status.errcode;
    res.description = status.description;

    return JSON.stringify(res);
}


exports.send = (res, data, status=exports.status_OK) => {
    let output = {};
    output.data = data; 
    output.status = {'errcode': status.errcode, 'description': status.description};
    res.status(status.returncode).send(output);
}