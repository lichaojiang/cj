'use strict'

const bTableBase = require('./bDatabaselib').tableBase;
const bconst  =require('./bConstants');

// table: plan
class plan extends bTableBase{
    constructor(table) {
        super(table);
        this.fixed_fields = {status: bconst.planStatus};
        this.success_msg = {created: "Plan created.", updated: "Plan updated", deleted: "Plan deleted."};
    }
}

// table: product
class product extends bTableBase{
    constructor(table){
        super(table);
        this.success_msg = {created: "Product created.", updated: "Product updated", deleted: "Product deleted."};
    }
}

// table: group
class group extends bTableBase{
    constructor(table) {
        super(table);
        this.success_msg = {created: "Group created.", updated: "Group updated", deleted: "Group deleted."};
    }
}

exports.plan = plan;
exports.product = product;
exports.group = group;