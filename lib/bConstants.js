'use strict'
const path = require('path');
const fs = require('fs');


let myappdir = path.resolve(__dirname, '..');
let exedir = path.resolve(__dirname, '..', 'EXE');

const bivstats_python_arr = ["/root/miniconda3/envs/bivstats/bin/python",
                             "/Users/Will/miniconda3/envs/bivstat/bin/python",
                             myappdir+"/envs/bivstats/bin/python"];

function bConstants()
{
    var constants = {};

    // myapp directory
    constants.myappdir = myappdir;
    
    // EXE directory
    constants.exedir = exedir

    // path for python in bivstats environment
    constants.statspython = findStatsPython();

    return constants;
}


// find path for python in bivstats environment
function findStatsPython()
{  
    let bivstats_python = "";
    let len = bivstats_python_arr.length;
    let isFound = false;
    for (let i=0; i<len; i++) {
        if (fs.existsSync(bivstats_python_arr[i]))
        {
            bivstats_python = bivstats_python_arr[i];
            break;
        }
    }

    return bivstats_python
}

module.exports = bConstants();