'use strict'

const bTableBase = require('./bDatabaselib').tableBase;
const bconst = require('./bConstants');

// table: plan
class plan extends bTableBase{
    constructor(table, organization_id) {
        super(table, organization_id);
        // read support
        this.join_fields = [`user@${this.org_id}.name AS assignee`, `product@${this.org_id}.name AS product_name`];
        this.innerjoin = [[`user@${this.org_id}`, `${this.table}.assignee_id = user@${this.org_id}.id`],
                          [`product@${this.org_id}`, `${this.table}.product_id = product@${this.org_id}.id`]];
                         
        this.fixed_fields = {status: bconst.planStatus};
        this.success_msg = {created: "Plan created.", updated: "Plan updated", deleted: "Plan deleted."};
    }
}

// table: product
class product extends bTableBase{
    constructor(table){
        super(table);
        // read support
        this.join_fields = [`productgroup@${this.org_id}.name AS group_name`];
        this.innerjoin = [[`productgroup@${this.org_id}`, `${this.table}.productgroup_id = productgroup@${this.org_id}.id`]];
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