'use strict'

const tableBase = require('./bDatabaselib').tableBase;
const bconst = require('./bConstants');

// table: plan
class plan extends tableBase{
    constructor(table) {
        super(table);
        // read support
        this.left_join = [{field: "assignee_id", target_table: "user", target_reference: "id", target_field: "name"},
                            {field: "product_id", target_table: "product", target_reference: "id", target_field: "name"}]
                         
        this.fixed_fields = {status: bconst.fixed_fields.planStatus.forRequest};
        this.success_msg = {created: "Plan created.", updated: "Plan updated", deleted: "Plan deleted."};
    }
}

// table: product
class product extends tableBase{
    constructor(table) {
        super(table);
        // read support
        this.left_join = [{field: "productgroup_id", target_table: "productgroup", target_reference: "id", target_field: "name"}]
        this.success_msg = {created: "Product created.", updated: "Product updated", deleted: "Product deleted."};
    }
}

// table: group
class group extends tableBase{
    constructor(table) {
        super(table);
        this.success_msg = {created: "Group created.", updated: "Group updated", deleted: "Group deleted."};
    }
}

exports.plan = plan;
exports.product = product;
exports.group = group;