'use strict'

const tableBase = require('./bDatabaselib').tableBase;


class variable extends tableBase {
    constructor(table) {
        super(table);
        this.promisesOnCreate = [this.filterAlowedField];
        this.promisesOnUpdate = [this.filterAlowedField];
        this.success_msg = { created: "variable created.", updated: "variable updated", deleted: "variable deleted" };

    }
    async get_recipe(req) {
        let table = tableBase.getTableName('variable', req.user.organization_id);
        let variable_id = req.body.query.variable_id;
        let type_cmd = `SELECT type FROM ${table} WHERE id = ${variable_id}`;
        let result = await this.sqlObj.query(type_cmd);
        
        if (result == 'basic') {
            let name_cmd = `SELECT name FROM ${table} WHERE id = ${variable_id}`;
            let results = await this.sqlObj.query(name_cmd);
            return results;
        } else if (result == 'user-defined') {
            let content_cmd = `SELECT content FROM ${table} WHERE id = ${variable_id}`;
            let results = await this.sqlObj.query(content_cmd);
            return results;
        }


    }


}



exports.variable = variable;