'use strict'

const tableBase = require('./bDatabaselib').tableBase;
var bres = require('./bResponse');
const sql = require('./bDatabaselib').sql

class variable extends tableBase{
    constructor(table) {
        super(table);
        this.addPromiseOnCreate(this.writeProtection);
        this.addPromiseOnUpdate(this.writeProtection);
        this.success_msg = {created: "variable created.", updated: "variable updated", deleted: "variable deleted"};
    }

    async writeProtection(req) {
        let organization_id = req.user.organization_id;
        if (req.body.method === "update") {
            let id = req.body.query.id;
            let table_name = tableBase.getTableName('variable', organization_id);
            let get_type_cmd = `SELECT type FROM ${table_name} WHERE id = ${id}`;
            let results = await this.sqlObj.query(get_type_cmd);
            let result = await sql.getRow(results, 0);
            let type = result.type;
            if (type === 'basic') {
                let protect_col = ['name', 'type', 'desrciption']
                for (let item of protect_col) {
                    delete req.body.query[item];
                }
            }
        }
        else if (req.body.method === "create") {
            if (req.body.query.type === "basic") {
                return await bres.throw(null, bres.ERR_BODY);
            }
        }
    }
}

exports.variable = variable;