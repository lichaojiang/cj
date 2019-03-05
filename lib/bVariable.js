'use strict'

const tableBase = require('./bDatabaselib').tableBase;


class variable extends tableBase {
    constructor(table) {
        super(table);
        this.addPromiseOnCreate(this.writeProtection);
        this.addPromiseOnUpdate(this.writeProtection);
        this.success_msg = {created: "variable created.", updated: "variable updated", deleted: "variable deleted"};

    }

    async get_recipe(req) {
        let table = tableBase.getTableName('variable', req.user.organization_id);
        let variable_id = req.body.query.variable_id;
        let type_cmd = `SELECT type FROM ${table} WHERE id = ${variable_id}`;
        let result = await this.sqlObj.query(type_cmd);
        let results_1 = await sql.getRow(result,0);
        
        if (results_1 == 'basic') {
            let name_cmd = `SELECT name FROM ${table} WHERE id = ${variable_id}`;
            let results = await this.sqlObj.query(name_cmd);
            let results_2 = await sql.getRow(results,0);
            return results_2;
        } else if (results_1 == 'user-defined') {
            let content_cmd = `SELECT content FROM ${table} WHERE id = ${variable_id}`;
            let results = await this.sqlObj.query(content_cmd);
            let results_3 = await this.sql.getRow(results,0);
            return results_3;
        }

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