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
    constants.exedir = exedir

    // path for python in bivstats environment
    constants.statspython = path.join(root, "/envs/bivstats/bin/python");

    return constants;
}

module.exports = bConstants();