'use strict'

class plan {
    constructor(sqlObj) {
        this.sqlObj = sqlObj;
    }

    create(table, field_arr) {
        if (field_arr.length !== 7) throw Error('Error: expect 7 fields.');
    
        let sqlObj = this.sqlObj;
        // retrieve field values
        let [code, quantity, begin, end, assignee, status, note] = field_arr;
        let values = `"${code}", ${quantity}, "${begin}", "${end}", "${assignee}", "${status}", "${note}"`;
    
        // compose query command
        let queryCmd = `INSERT INTO "${table}" VALUES (${values})`;
    
        // call query
        sqlObj.query(queryCmd, sqlObj.queryOk);
    }

    read(table, limit=10) {
        let sqlObj = this.sqlObj;
        let order = `ORDER BY id DECS`;
        let limit = `LIMIT ${limit}`;
    
        // compose query command
        let queryCmd = `SELECT * FROM "${table}" ${order} ${limit}`;
    
        // call query
        sqlObj.query(queryCmd, sqlObj.queryOk);
    }

    update(table, id ,fields) {
        let sqlObj = this.sqlObj;
        let updates = '';
        Object.keys(fields).forEach((key) => {
            updates += `"${key}" = ${fields[key]}, `
        });
    
        //remove the ending comma and space
        updates = updates.slice(0, -2);
    
        // compose query command
        let queryCmd = `UPDATE ${table} SET ${updates} WHERE id = ${id}`;
    
        //call query
        sqlObj.query(queryCmd, sqlObj.queryOk);
    }

    delete(table, id) {
        let sqlObj = this.sqlObj;
        let queryCmd = `DELETE FROM ${table} WHERE id = ${id}`;
        sqlObj.query(queryCmd, sqlObj.queryOk);
    }
}

exports.plan = plan;