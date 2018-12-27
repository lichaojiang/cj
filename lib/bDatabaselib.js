'use strict'

const mysql = require('mysql');
const bres = require('./bResponse');

class sql {
    constructor(res, connLimit=10) {
        this.res = res;
        this.pool  = mysql.createPool({
            connectionLimit : connLimit,
            host            : 'admin.bivrost.cn',
            user            : process.env.DB_USER,
            password        : process.env.DB_PASSWORD,
            database        : 'bivcloud',
            port            : '3306'
        });
    }

    // return a Promise
    // reject: response status
    // resolve: [results, fields]
    query(queryCmd) {
        let sqlObj = this;
        return new Promise((resolve, reject) => {
            sqlObj.pool.getConnection(function(err, connection) {
                if (err) {
                    return reject(bres.getErrcode(bres.ERR_SQL_CONNETION));
                }
                
                // Use the connection
                connection.query(queryCmd, (err, results, fields) => {
                    // When done with the connection, release it.
                    connection.release();
                    
                    // Handle error after the release.
                    if (err) {
                        console.log(err);
                        return reject(bres.getErrcode(bres.ERR_SQL_QUERY));
                    }
                    resolve([results, fields]);
                
                    // Don't use the connection here, it has been returned to the pool.
                });
            })     
        })
    }

    async end() {
        await this.pool.end((err) => {
            if (err) {
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_END));
            }
        });
    }

    static getRow(results, i) {
        return results[i]
    }

    static getNumOfRows(results) {
        return results.length || 0;
    }

    static getAffectedFields(results) {
        return results.affectedRows || 0;
    }
}

// sql table base
// Child class could include the following settings:
// this.uniqueCols = ['code'];
// this.primaryKey = 'id';
// this.required = ['product_id', 'quantity', 'begin', 'end', 'assignee_id', 'status'];
// this.fixed_fields = {status: bconst.planStatus};
// this.success_msg = {created: "Plan created.", updated: "Plan updated", deleted: "Plan deleted."};
class tableBase {
    constructor(sqlObj, table){
        this.sqlObj = sqlObj;
        this.table = table;
        this.dupl_array = [];
        this.missing_arr = [];
        this.mismatch_arr = [];
        this.promisesOnCreate = [this.checkDuplicate, this.checkRequired, this.checkFixedFields];
        this.promisesOnUpdate = [this.checkDuplicate, this.checkFixedFields];
    }

    async create(new_items) {
        if (typeof new_items !== 'object')
            return Promise.reject(bres.getErrcode(bres.ERR_SQL_BODY));
            
        let sqlObj = this.sqlObj;
        let tableObj = this;
        //pre-check promise
        return Promise.all(this.getPromisesOnCreate(new_items)).then(async () => {
            let table = tableObj.table;    

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
        if (typeof new_items !== 'object')
            return Promise.reject(bres.getErrcode(bres.ERR_SQL_BODY));

        let sqlObj = this.sqlObj;
        let tableObj = this;
        let id = new_items.id;
        // remote id from new items
        delete new_items.id;
        return Promise.all(this.getPromisesOnUpdate(new_items)).then(async () => {
            let table = tableObj.table;
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
                if (sql.getAffectedFields(results) == 1)
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
        if (typeof id_array === 'number') {
            id += id_array;
        }
        else if (Array.isArray(id_array)){
            for (let i = 0; i < id_array.length; i++) {
                let element = id_array[i];
                if (typeof element !== 'number') continue;
                id += `${element}, `;
            }

            // no id to remove
            if (id.length === 0) return Promise.reject(bres.getErrcode(bres.ERR_SQL_ID));

            //remove the ending comma and space
            id = id.slice(0, -2);
        }
        else {
            // no id to remove
            if (id.length === 0) return Promise.reject(bres.getErrcode(bres.ERR_SQL_ID));
        }

        let queryCmd = `DELETE FROM ${table} WHERE id in (${id})`;

        //call query
        return sqlObj.query(queryCmd).then(onResolved => {
            let results = onResolved[0];
            if (sql.getAffectedFields(results) > 0)
                return Promise.resolve(bres.status_OK);
            else
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_ID));  
        });
    }

    // check if the new field obj meets uniqueness requirement.
    // resolve: duplicate array
    // reject: rejected status
    async checkDuplicate (new_items) {
        let tableObj = this;
        if (typeof new_items !== 'object')
            return Promise.reject(bres.getErrcode(bres.ERR_SQL_BODY));
        if (typeof tableObj.uniqueCols === 'undefined')
            return Promise.resolve(bres.status_OK);

        return Promise.all(Object.keys(new_items).map(async (key) => {
            if (tableObj.uniqueCols.includes(key)) {
                let value = '';
                if (typeof new_items[key] === 'number')
                    value += `${new_items[key]}, `
                else
                    value += `'${new_items[key]}', `
                
                value = value.slice(0, -2);
                // find existed records if any
                let queryCmd = `SELECT * FROM ${tableObj.table} WHERE ${key} = ${value}`;
                // use promise to handle sql connection
                return tableObj.sqlObj.query(queryCmd).then(onResolved => {
                    let results = onResolved[0];
                    // records exist if row number is more than 0
                    if (sql.getNumOfRows(results) > 0) 
                        // push duplicate col to dupliacate array
                        this.dupl_array.push(key);
                });
            }
        })).then(() => {
            if (this.dupl_array.length === 0) 
                return Promise.resolve(bres.status_OK);
            else
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_DUPLICATE));
        })           
    }

    // ensure required fields provided
    // resolve: status_OK
    // reject: missing required fields 
    async checkRequired(new_items) {
        let tableObj = this;
        if (typeof new_items !== 'object')
            return Promise.reject(bres.getErrcode(bres.ERR_SQL_BODY));
        if (typeof tableObj.required === 'undefined')
            return Promise.resolve(bres.status_OK);

        return Promise.all(tableObj.required.map(element => {
            if (!Object.keys(new_items).includes(element)) 
                tableObj.missing_arr.push(element)
        })).then(() => {
            // resolve
            if (tableObj.missing_arr.length == 0)
                return Promise.resolve(bres.status_OK);
            else
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_REQUIRED));
        });
    }

    // make sure fixed field values are correct
    // resolve: status_OK
    // reject: mismatch array
    async checkFixedFields(new_items) {
        let tableObj = this;
        if (typeof new_items !== 'object')
            return Promise.reject(bres.getErrcode(bres.ERR_SQL_BODY));
        
        if (typeof tableObj.fixed_fields === 'undefined')
            return Promise.resolve(bres.status_OK);

        return Promise.all(Object.keys(new_items).map(async (key) => {
            // if key in fixed_fields
            if (Object.keys(tableObj.fixed_fields).includes(key)) {
                // if new value is not in fixed values
                if (!tableObj.fixed_fields[key].includes(new_items[key]))
                tableObj.mismatch_arr.push(key);
            }
        })).then(() => {
            if (tableObj.mismatch_arr.length === 0) 
                return Promise.resolve(bres.status_OK);
            else
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_MISMATCH));
        }) 
    }

    getPromisesOnCreate(new_items) {
        let promiseList = [];
        for (let i = 0; i < this.promisesOnCreate.length; i++) {
            let promise = this.promisesOnCreate[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(new_items));
        }
        return promiseList;
    }

    getPromisesOnUpdate(new_items) {
        let promiseList = [];
        for (let i = 0; i < this.promisesOnUpdate.length; i++) {
            const promise = this.promisesOnUpdate[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(new_items));
        }
        return promiseList;
    }

    addPromiseOnCreate(callback) {
        this.promisesOnCreate.push(callback);
    }

    addPromiseOnUpdate(callback) {
        this.promisesOnUpdate.push(callback);
    }

    getDataFromStatus(err_status) {
        let data = null;
        switch (bres.getErrcode(err_status)) {
            case bres.getErrcode(bres.ERR_SQL_REQUIRED):
                data = this.missing_arr;
                break;
            case bres.getErrcode(bres.ERR_SQL_DUPLICATE):
                data = this.dupl_array;
                break;
            case bres.getErrcode(bres.ERR_SQL_MISMATCH):
                data = {};
                for (let i = 0; i < this.mismatch_arr.length; i++) {
                    const key = this.mismatch_arr[i];
                    data[key] = this.fixed_fields[key];
                }
                break;
            default:
                break;
        }
        return data;
    }
}

exports.sql = sql;
exports.tableBase = tableBase;