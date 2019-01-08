'use strict'

exports.status_OK = {"returncode": 200, "errcode": 0, "description":"ok"}
//##################################################
//#                   WARNING                      #
//##################################################
//# cannot find data in database
exports.WARN_NO_DATA = {"returncode": 204, "errcode":-10001, "description":"No data found with current selection."}

exports.WARN_EMPTY_INTERVAL = {"returncode": 204, "errcode": -10101, "description":"Warn: One or more intervals unavailable."}

exports.WARN_CORE = {"returncode": 204, "errcode": -10300, "description":"Warn: Core warnings exist."}



//##################################################
//#                    ERROR                       #
//##################################################
exports.ERROR = {"returncode": 500, "errcode": -20000, "description": "Exception raised"}
exports.ERROR_INDEX_OUT_OF_RANGE = {"returncode": 500, "errcode": -20001, "description": "Index out of range"}
exports.ERR_REQUIRED = {"returncode": 400, "errcode": -20002, "description":"Error: Missing required fields."}
exports.ERR_BODY = {"returncode": 400, "errcode": -20003, "description":"Error: Invalid body."}

exports.ERR_PLOT = {"returncode": 500, "errcode":-20100, "description":"Error: plot error."}
exports.ERR_PLOT_INTERVAL = {"returncode": 400, "errcode":-20101, "description":"Error: Expect interval_start.length == interval_end.length."}
exports.ERR_PLOT_BIN_NULL = {"returncode": 400, "errcode":-20102, "description":"Error: Histogram bin must be specified, and more than 0."}

exports.ERR_SQL = {"returncode": 500, "errcode":-20200, "description":"Error: SQL error."}
exports.ERR_SQL_QUERY = {"returncode": 400, "errcode":-20201, "description":"Error: Failed to query database."}
exports.ERR_SQL_CONNETION = {"returncode": 400, "errcode":-20202, "description":"Error: Failed to connect to database."}
exports.ERR_SQL_RELEASE = {"returncode": 400, "errcode":-20203, "description":"Error: Failed to release pooling connection."}
exports.ERR_SQL_END = {"returncode": 400, "errcode":-20204, "description":"Error: Failed to end connection."}
exports.ERR_SQL_ID = {"returncode": 400, "errcode":-20205, "description":"Error: Incorrect id."}
exports.ERR_SQL_DUPLICATE = {"returncode": 400, "errcode": -20206, "description":"Error: Duplicate fields exist."}
exports.ERR_SQL_REQUIRED = {"returncode": 400, "errcode": -20207, "description":"Error: Missing required fields."}
exports.ERR_SQL_BODY = {"returncode": 400, "errcode": -20208, "description":"Error: Invalid request body."}
exports.ERR_SQL_MISMATCH = {"returncode": 400, "errcode": -20209, "description":"Error: Incorrect value for fixed fields."}

exports.ERR_CORE = {"returncode": 400, "errcode":-20300, "description":"Error: Core errors exist."}

exports.ERR_USER = {"returncode": 400, "errcode":-20400, "description":"Error: User error."}
exports.ERR_USER_HASH = {"returncode": 400, "errcode":-20401, "description":"Error: Exception in hashing password."}

exports.send = (res, data, status=exports.status_OK) => {
    let output = {};
    output.data = data;
    let errcode = status.errcode;
    if (typeof errcode === 'undefined')
        errcode = exports.ERROR.code
    let description = status.description || status;
    output.status = {'errcode': errcode, 'description': description};
    res.status(status.returncode).send(output);
}

exports.isValidStatus = async (status) => {
    const status_keys = ['returncode', 'errcode', 'description'];
    return Promise.all([status_keys.map(key => {
        if (status.hasOwnProperty(key))
            Promise.resolve();
        else if (!isNaN(status))
            Promise.resolve();
        else
            Promise.reject();
    })])
}

exports.reject = (reject, status) => {
    return exports.isValidStatus(status).then(success => {
        reject(Error(status.errcode))
    }).catch(err => {
        reject(Error(exports.ERROR.errcode))
    });
}

exports.findStatus = (code) => {
    let status = exports.ERROR;
    if (typeof code === 'number') {
        let keys = Object.keys(exports);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (exports[key].hasOwnProperty('errcode')) {
                if (exports.getErrcode(exports[key]) === code) {
                    status = exports[key];
                    break;
                }
            }
        }
    }
    
    return status
}

exports.getErrcode = (status) => {
    return status.errcode;
}