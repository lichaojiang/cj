'use strict'

const bres = require('./bResponse');
const sqlCls = require('./bDatabaselib').sql;

class tableBase {
    constructor(){
        return 0
    }

    // check if the new field obj meets uniqueness requirement.
    // resolve: duplicate array
    // reject: rejected status
    async checkDuplicate (new_items) {
        let tableObj = this;
        let dupl_array = [];

        return Promise.all(Object.keys(new_items).map(async (item) => {
            if (tableObj.uniqueCols.includes(item)) {
                // find existed records if any
                let queryCmd = `Select * FROM ${tableObj.table} WHERE ${col} = '${item}'`;
                // use promise to handle sql connection
                return tableObj.sqlObj.query(queryCmd).then(onResolved => {
                    let results = onResolved[0];
                    // records exist if row number is more than 0
                    if (sqlCls.getNumOfRows(results) > 0) 
                        // push duplicate col to dupliacate array
                        dupl_array.push(col);
                });
            }
        })).then(() => {
            if (dupl_array.length === 0) 
                return Promise.resolve(bres.status_OK);
            else
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_DUPLICATE));
        })           
    }

    // ensure required fields provided
    // resolve: status_OK
    // reject : missing required fields 
    checkRequired(new_items) {
        let tableObj = this;
        let missing_arr = [];

        return Promise.all(tableObj.required.map(element => {
            if (!Object.keys(new_items).includes(element)) 
                missing_arr.push(element)
        })).then(() => {
            // resolve
            if (missing_arr.length == 0)
                return Promise.resolve(bres.status_OK);
            else
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_REQUIRED));
        });
    }
}


class plan extends tableBase{
    constructor(sqlObj, table) {
        super();
        this.sqlObj = sqlObj;
        this.uniqueCols = ['code'];
        this.primaryKey = 'id';
        this.required = ['product_id', 'quantity', 'begin', 'end', 'assignee', 'status_id'];
        this.table = table;
    }

    // field_arr: [code, quantity, begin, end, assignee, status, note]
    create(new_items) {
        let sqlObj = this.sqlObj;
        let planObj = this;
        //pre-check promise
        return Promise.all([this.checkDuplicate(new_items), this.checkRequired(new_items)]).then(async () => {
            let table = planObj.table;    

            let insert_fields = '';
            let insert_values = '';

            // loop through all new items to create insert_fields and insert_values
            return Promise.all(Object.keys(new_items).map(async (key) => {
                insert_fields += `${key}, `;
                if (typeof new_items[key] === 'number')
                    insert_values += `${new_items[key]}, `
                else
                    insert_values += `'${new_items[key]}', `
            })).then(async () => {
                //remove the ending comma and space
                insert_fields = insert_fields.slice(0, -2);
                insert_values = insert_values.slice(0, -2);

                // compose query command
                let queryCmd = `INSERT INTO ${table} (${insert_fields}) VALUES (${insert_values})`;

                // call query
                return sqlObj.query(queryCmd);
            })
        })
    }

    read(limit, page) {
        let sqlObj = this.sqlObj;
        let table = this.table;
        let offset = `OFFSET ${limit*(page-1)}`;
        let order = `ORDER BY id DESC`;
        let limitStr = `LIMIT ${limit}`;
    
        // compose query command
        let queryCmd = `SELECT * FROM ${table} ${order} ${limitStr} ${offset}`;
        // call query
        return sqlObj.query(queryCmd).then(onResolved => {
            return Promise.resolve(onResolved[0]);
        })
    }

    update(new_items) {
        let sqlObj = this.sqlObj;
        let planObj = this;
        let id = new_items.id;
        // remote id from new items
        delete new_items.id;
        return this.checkDuplicate(new_items).then(async () => {
            let table = planObj.table;
            let updates = '';
            Object.keys(new_items).forEach((key) => {
                if (typeof new_items[key] === 'number')
                    updates += `${key} = ${new_items[key]}, `
                else
                    updates += `${key} = "${new_items[key]}", `
            });
        
            //remove the ending comma and space
            updates = updates.slice(0, -2);
        
            // compose query command
            let queryCmd = `UPDATE ${table} SET ${updates} WHERE id = ${id}`;
        
            return sqlObj.query(queryCmd).then(onResolved => {
                let results = onResolved[0];
                if (sqlCls.getAffectedFields(results) == 1)
                    return Promise.resolve(bres.status_OK);
                else
                    return Promise.reject(bres.getErrcode(bres.ERR_SQL_ID));
            })
        })
    }

    delete(id_array) {
        let table = this.table;
        let sqlObj = this.sqlObj;

        let id = "";
        for (let i = 0; i < id_array.length; i++) {
            let element = id_array[i];
            if (typeof element !== 'number') continue;
            id += `${element}, `;
        }

        // no id to remove
        if (id.length === 0) return Promise.reject(bres.getErrcode(bres.ERR_SQL_ID));

        //remove the ending comma and space
        id = id.slice(0, -2);

        let queryCmd = `DELETE FROM ${table} WHERE id in (${id})`;

        //call query
        return sqlObj.query(queryCmd).then(onResolved => {
            let results = onResolved[0];
            if (sqlCls.getAffectedFields(results) > 0)
                return Promise.resolve(bres.status_OK);
            else
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_ID));  
        });
    }
}

exports.plan = plan;