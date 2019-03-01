'use strict'

const tableBase = require('./bDatabaselib').tableBase;
const bconst = require('./bConstants');

class variable extends tableBase{
    constructor(table) {
        super(table);
        this.success_msg = {created: "variable created.", updated: "variable updated", deleted: "variable deleted"};
    }
}

exports.variable = variable;