'use strict'

const tableBase = require('./bDatabaselib').tableBase;


class variable extends tableBase{
    constructor(table) {
        super(table);
        this.promisesOnCreate = [this.filterAlowedField];
        this.promisesOnUpdate = [this.filterAlowedField];
        this.success_msg = {created: "variable created.", updated: "variable updated", deleted: "variable deleted"};

    }
async get_recipe (){
    let table = tableBase.getTableName('variable',organization_id);
    let variable_id = req.body.query.variable_id;
    let type_cmd = `SELECT type FROM ${table} WHERE id = ${variable_id}`;
    let result = async this.sqlObj.query(type_cmd);
    if(type_cmd =='basic'){
        let name_cmd = 'SELECT name FROM ${table} WHERE id = ${variable_id}';
        return name_cmd;        
    }else if(type_cmd == 'user-defined'){
        let content_cmd = 'SELECT content FROM ${table} WHERE id = ${variable_id}';
        return content_cmd;
    }
    
    
}


}



exports.variable = variable;