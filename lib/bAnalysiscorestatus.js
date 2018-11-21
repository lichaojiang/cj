'use strict'

const execSync = require('child_process').execSync;
const path = require('path');
const bconst = require('./bConstants');

let api = path.join(bconst.exedir, 'exposeStatus.py');
let cmdstr = bconst.statspython + ' ' + api;
let stdout = execSync(cmdstr);


let status = JSON.parse(stdout);

exports.isSTATUSOK = (code) => {
    let isOk = false;
    if (status.status_OK.code === code) {
        isOk = true;
    }
    return isOk;
}

exports.isWARN_NO_DATA = (code) => {
    let isWarn = false;
    if (status.WARN_NO_DATA.code === code) {
        isWarn = true;
    }
    return isWarn;
}

exports.isWARN_ZERODIVISION = (code) => {
    let isWarn = false;
    if (status.WARN_ZERODIVISION.code === code) {
        isWarn = true;
    }
    return isWarn;
}

exports.status = status;