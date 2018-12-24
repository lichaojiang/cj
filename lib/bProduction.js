'use strict'

const bTableBase = require('./bDatabaselib').tableBase;
const bconst  =require('./bConstants');

// table: plan
class plan extends bTableBase{
    constructor(sqlObj, table) {
        super(sqlObj, table);
        this.uniqueCols = ['code'];
        this.primaryKey = 'id';
        this.required = ['product_id', 'quantity', 'begin', 'end', 'assignee_id', 'status'];
        this.fixed_fields = {status: bconst.planStatus};
        this.success_msg = {created: "Plan created.", updated: "Plan updated", deleted: "Plan deleted."};
    }
}

// table: product
class product extends bTableBase{
    constructor(sqlObj, table){
        super(sqlObj, table);
        this.uniqueCols = ['code', 'name'];
        this.primaryKey = 'id';
        this.required = ['name'];
        this.success_msg = {created: "Product created.", updated: "Product updated", deleted: "Product deleted."};
    }
}

// table: group
class group extends bTableBase{
    constructor(sqlObj, table) {
        super(sqlObj, table);
        this.uniqueCols = ['name', 'code'];
        this.primaryKey = 'id';
        this.required = ['name'];
        this.success_msg = {created: "Group created.", updated: "Group updated", deleted: "Group deleted."};
    }
}

exports.plan = plan;
exports.product = product;
exports.group = group;