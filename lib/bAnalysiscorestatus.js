'use strict'

const execSync = require('child_process').execSync;
const path = require('path');
const bconst = require('./bConstants');
const debug = require('debug')('corestatus: ');

let api = path.join(bconst.exedir, 'exposeStatus.py');
let cmdstr = bconst.statspython + ' ' + api;
let stdout = execSync(cmdstr);


let status = JSON.parse(stdout);
debug(status);

exports.isSTATUSOK = (errcode) => {
    let isOk = false;
    if (status.status_OK.errcode === errcode) {
        isOk = true;
    }
    return isOk;
}

exports.isWARN_NO_DATA = (errcode) => {
    let isWarn = false;
    if (status.WARN_NO_DATA.errcode === errcode) {
        isWarn = true;
    }
    return isWarn;
}

exports.isWARN_ZERODIVISION = (errcode) => {
    let isWarn = false;
    if (status.WARN_ZERODIVISION.errcode === errcode) {
        isWarn = true;
    }
    return isWarn;
}

exports.isWarn = (errcode) => {
    let isWarn = false;
    if (errcode <= -10000 & errcode > -20000) {
        isWarn = true;
    }
    return isWarn;
}

exports.isError = (errcode) => {
    let isErr = false;
    if (errcode <= -20000) {
        isErr = true;
    }
    return isErr;
}

exports.status = status;