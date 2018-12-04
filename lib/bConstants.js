'use strict'
const path = require('path');
const fs = require('fs');


let root = path.resolve(__dirname, '..');
let exedir = path.resolve(__dirname, '..', 'EXE');

function bConstants()
{
    var constants = {};

    // myapp directory
    constants.root = root;
    
    // EXE directory
    constants.exedir = exedir;

    // path for python in bivstats environment
    constants.statspython = path.join(root, "/envs/bivstats/bin/python");

    constants.corsOptions = {
        origin: ["http://www.bivrost.cn",
                 "http://admin.bivrost.cn",
                 "http://127.0.0.1",
                 "http://localhost",
                 "http://localhost:9528"],
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    };

    return constants;
}

module.exports = bConstants();