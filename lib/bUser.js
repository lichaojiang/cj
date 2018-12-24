const bTableBase = require('./bDatabaselib').tableBase;
const bconst  =require('./bConstants');

class user extends bTableBase {
    constructor(sqlObj, table) {
        super(sqlObj, table);
        this.uniqueCols = ['email'];
        this.primaryKey = 'id';
        this.required = ['email', 'name', 'password', 'organization_id'];
        this.success_msg = {created: "User created.", updated: "User updated", deleted: "User deleted."};
    }
}

module.exports = user;