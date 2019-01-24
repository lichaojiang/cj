'use strict'
const path = require('path');
const fs = require('fs');


let root = path.resolve(__dirname, '..');
let exedir = path.resolve(__dirname, '..', 'EXE');

let dump_root = path.join(root, 'dumps');
if (!fs.existsSync(dump_root)){
    fs.mkdirSync(dump_root);
}

function bConstants()
{
    var constants = {};

    // myapp directory
    constants.root = root; 
    
    // EXE directory
    constants.exedir = exedir;

    // dumps directory
    constants.dump_root = dump_root;

    // path for python in bivstats environment
    constants.statspython = path.join(root, "/envs/bivstats/bin/python");

    constants.corsOptions = {
        origin: ["http://www.bivrost.cn",
                 "http://admin.bivrost.cn",
                 "http://127.0.0.1",
                 "http://localhost",
                 "http://localhost:9528",
                 "http://localhost:9529"],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    };

    constants.fixed_fields = {planStatus: {forRequest: ['waiting', 'working', 'complete', 'delayed'], forShowField_cn: ['未开始', '生产中', '完成', '延期']},
                              gender: {forRequest: ['male', 'femail'], forShowField_cn: ['男', '女']}};

    // constants.privileges = {privileges: ["admin", "production", "user", "monitor"]}
    
    constants.sharedTables = {user: 'user', organization: 'organization'}

    return constants;
}

module.exports = bConstants();