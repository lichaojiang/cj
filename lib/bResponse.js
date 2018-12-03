'use strict'

exports.status_OK = {"code": 0, "description":"ok"}
//##################################################
//#                   WARNING                      #
//##################################################
//# cannot find data in database
exports.WARN_NO_DATA = {"code":-10001, "description":"No data found with current selection."}

exports.WARN_EMPTY_INTERVAL = {"code":-10101, "description":"Warn: One or more intervals unavailable."}


//##################################################
//#                    ERROR                       #
//##################################################
exports.ERROR = {"code": -20000, "description": "Exception raised"}
exports.ERR_ARGUMENTS = {"code":-20001, "description":"Error: Wrong arguments."}
exports.ERR_WRITEFILE = {"code":-20002, "description":"Error: Cannot write to file."}

exports.ERR_PLOT = {"code":-20100, "description":"Error: plot error."}
exports.ERR_PLOT_INTERVAL = {"code":-20101, "description":"Error: Expect interval_start.length == interval_end.length."}
exports.ERR_AMOUNT_NULL = {"code":-20102, "description":"Error: Histogram bin amount must be specified, and more than 0."}

exports.ERR_SQL = {"code":-20200, "description":"Error: SQL error."}
exports.ERR_SQL_QUERY = {"code":-20201, "description":"Error: Failed to query database."}
exports.ERR_SQL_CONNETION = {"code":-20202, "description":"Error: Failed to connect database."}
exports.ERR_SQL_RELEASE = {"code":-20203, "description":"Error: Failed to release pooling connection."}
exports.ERR_SQL_END = {"code":-20204, "description":"Error: Failed to end connection."}

exports.setup = (data, status) => {
    if (typeof(data) !== 'object') throw Error('Expect data to be an object')
    let res = {};
    res.data = data;
    res.code = status.code;
    res.description = status.description;

    return JSON.stringify(res);
}


exports.send = (res, data, status=exports.status_OK) => {
    let output = {};
    output.data = data; 
    output.status = {'code': status.code, 'description': status.description};
    res.send(output)
}