'use strict'

const mysql = require('mysql');
const bres = require('./bResponse');
const bconst = require('./bConstants');

class sql {
    constructor(connLimit=10) {
        this.pool  = mysql.createPool({
            connectionLimit : connLimit,
            host            : 'admin.bivrost.cn',
            user            : process.env.DB_USER,
            password        : process.env.DB_PASSWORD,
            database        : process.env.DB,
            port            : '3306'
        });
    }

    // return a Promise
    // reject: response status
    // resolve: [results, fields]
    query(queryCmd) {
        return new Promise((resolve, reject) => {
            let sqlObj = this;
            sqlObj.pool.getConnection(async function(err, connection) {
                if (err) {
                    return await bres.throw(reject, bres.ERR_SQL_CONNETION)
                }
                
                // Use the connection
                connection.query(queryCmd, async (err, results, fields) => {
                    // When done with the connection, release it.
                    connection.release();
                    
                    // Handle error after the release.
                    if (err) {
                        console.log(err);
                        return await bres.throw(reject, bres.ERR_SQL_QUERY)
                    }
                    // resolve([results, fields]);
                    resolve(results);
                
                    // Don't use the connection here, it has been returned to the pool.
                });
            })
        })
    }

    end() {
        return new Promise((resolve, reject) => {
            this.pool.end(async (err) => {
                if (err) {
                    return await bres.throw(reject, bres.ERR_SQL_END);
                }
                resolve();
            });
        })
    }

    static async getRow(results, i) {
        if (results.length > i)
            return results[i];
        else 
            await bres.throw(bres.ERROR_INDEX_OUT_OF_RANGE);
    }

    static getNumOfRows(results) {
        return results.length || 0;
    }

    static getAffectedFields(results) {
        return results.affectedRows || 0;
    }
}

// sql table base
class tableBase {
    constructor(table){
        this.sqlObj = new sql();
        this.table = table;

        // used for pre-checking
        this.dupl_array = [];
        this.missing_arr = [];
        this.mismatch_arr = [];
        this.err_field_arr = [];

        // overwrite this array in children class if unintended data need to be removed from results
        this.redundant_arr = [];

        this.promisesOnCreate = [this.checkDuplicate, this.checkRequired, this.checkFixedFields];
        this.promisesOnUpdate = [this.checkDuplicate, this.checkFixedFields];
        this.promisesAfterRead = [this.removeRedundantData];
    }

    async endSql() {
        await this.sqlObj.end();
    }

    async create(req) {
        let new_items = req.body.query;
        if (typeof new_items !== 'object')
            await bres.throw(null, bres.ERR_SQL_BODY);
            
        let sqlObj = this.sqlObj;
        let tableObj = this;
        //pre-check promise
        return Promise.all(this.getPromisesOnCreate(req)).then(async () => {
            let table = tableBase.getTableName(tableObj.table, req.user.organization_id);

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

    async joinTable(req) {
        let this_table = tableBase.getTableName(this.table, req.user.organization_id);
        let joined = this_table;
        try {
            if (typeof this.left_join !== 'undefined') {
                for (let join of this.left_join) {
                    let target_table = tableBase.getTableName(join.target_table, req.user.organization_id);
                    joined += ` LEFT JOIN ${target_table} ON ${this_table}.${join.field} = ${target_table}.${join.target_reference}`;
                }
            }
        } catch (error) {
            await bres.throw(null, bres.ERROR);
        }
        
        return joined;
    }

    async parseCond(req) {
        let query = req.body.query;
        let skip_keys = ['limit', "page", "order"];
        let conds = "";
        let err_field_arr = this.err_field_arr;
        let this_table = tableBase.getTableName(this.table, req.user.organization_id);
        Object.keys(query).map(key => {
            let cond = query[key];
            if (!skip_keys.includes(key) & cond !== "") {
                // array: values
                if (Array.isArray(cond)) {
                    if (cond.length === 0) return

                    let values = "";
                    cond.map(value => {
                        if (typeof value === 'number')
                            values += `${value}, `;
                        else 
                            values += `'${value}', `;
                    })
                    values = values.slice(0, -2);
                    conds += `${this_table}.${key} IN (${values}) AND`;
                }
                // number: value
                else if (typeof cond === 'number') {
                    conds += `${this_table}.${key} = ${cond} AND`;
                }
                // string
                else if (typeof cond === 'string') {
                    conds += `${this_table}.${key} = '${cond}' AND`;
                }
                // object: range
                else if (typeof cond === 'object') {
                    // {"cond": {"range": [0, 2]}}
                    if (typeof cond.range !== 'undefined') {
                        // check if array
                        if (!Array.isArray(cond.range)) return err_field_arr.push(key);
                        // check if two elements
                        if (cond.range.length !== 2) return err_field_arr.push(key);
                        
                        conds += `${this_table}.${key} >= ${cond.range[0]} AND ${this_table}.${key} <= ${cond.range[1]} AND`;
                    }
                    // not supported
                    else {
                        return err_field_arr.push(key);
                    }
                }
                // not supported
                else {
                    return err_field_arr.push(cond);
                }
            }
        })

        if (err_field_arr.length === 0) {
            let allConds = "";

            if (await this.isSoftDeletion(req.user.organization_id)) {
                allConds += `${this_table}.isdeleted = 0 AND `;
            }

            // add organization id condition for shared table
            for (let i in bconst.sharedTables) {
                if (bconst.sharedTables[i] === this.table) {
                    allConds += `organization_id = ${req.user.organization_id} AND `
                    break;
                }
            }

            if (conds.length !== 0) {
                allConds += conds;          
            }
            // remove the last " AND"
            allConds = allConds.slice(0, -4);
            if (allConds.length !== 0)
                allConds = `WHERE ${allConds}`;
            return allConds;
        }
        else {
            await bres.throw(null, bres.ERR_SQL_REQUEST_FIELD);
        }
    }

    orderBy(req) {
        let order = `ORDER BY id DESC`;
        if (typeof req.body.query.order !== 'undefined') {
            let set = req.body.query.order;
            order = `ORDER BY ${set[0]} ${set[1]}`;
        }
        return order
    }

    async selectFields(req) {
        let this_table = tableBase.getTableName(this.table, req.user.organization_id);
        let select = `${this_table}.*`;

        if (typeof this.left_join !== 'undefined') {
            for (let join of this.left_join) {
                let target_table = tableBase.getTableName(join.target_table, req.user.organization_id);
                select += `, ${target_table}.${join.target_field} AS ${join.target_table}_${join.target_field}`;
            }
        }
        
        return select;
    }

    async removeRedundantData(req, results) {
        if (sql.getNumOfRows(results) === 0) return 

        let redundant_arr = ['isdeleted', 'created_at', 'updated_at'];
        redundant_arr = redundant_arr.concat(this.redundant_arr);
        redundant_arr.forEach(field => {
            for (let result_i of results) {
                delete result_i[field];
            }
        })
    }

    async read(req) {
        let limit = req.body.query.limit || 10;
        let page = req.body.query.page || 1;

        let sqlObj = this.sqlObj;

        let offset = `OFFSET ${limit*(page-1)}`;
        let order = this.orderBy(req);
        let limitStr = `LIMIT ${limit}`;

        let [table, cond, select] = await Promise.all([this.joinTable(req), this.parseCond(req), this.selectFields(req)]);

        // compose query command    
        let queryCmd_results = `SELECT ${select} FROM ${table} ${cond} ${order} ${limitStr} ${offset}`;
        let queryCmd_total = `SELECT COUNT(*) FROM ${table} ${cond}`;
        // query database
        let [results, total] = await Promise.all([sqlObj.query(queryCmd_results), sqlObj.query(queryCmd_total)]);

        await Promise.all([this.getPromisesAfterRead(req, results)]);
        return {results: results, total: total[0]['COUNT(*)']};
    }

    async update(req) {     
        let new_items = req.body.query;
        if (typeof new_items !== 'object')
            await bres.throw(null, bres.ERR_SQL_BODY);

        let id = req.body.query.id;
            if (isNaN(id))
                await bres.throw(null, bres.ERR_SQL_ID);

        let sqlObj = this.sqlObj;
        let tableObj = this;
        // remote id from new items, id is not needed for pre-checking
        delete new_items.id;

        await Promise.all(this.getPromisesOnUpdate(req));

        let table = tableBase.getTableName(tableObj.table, req.user.organization_id);
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
        let results = await sqlObj.query(queryCmd);

        if (sql.getAffectedFields(results) !== 1)
            return await bres.throw(null, bres.ERR_SQL_ID);

        return bres.status_OK;
    }

    async delete(req) {
        let id_array = req.body.query.id;
        let table = tableBase.getTableName(this.table, req.user.organization_id);
        let sqlObj = this.sqlObj;

        let id = "";
        if (!isNaN(id_array)) {
            id += id_array;
        }
        else if (Array.isArray(id_array)){
            for (let i = 0; i < id_array.length; i++) {
                let element = id_array[i];
                if (isNaN(element)) continue;
                id += `${element}, `;
            }

            // no id to remove
            if (id.length === 0) await bres.throw(null, bres.ERR_SQL_ID);

            //remove the ending comma and space
            id = id.slice(0, -2);
        }
        else {
            // no id to remove
            if (id.length === 0) await bres.throw(null, bres.ERR_SQL_ID);
        }

        let queryCmd = `DELETE FROM ${table} WHERE id in (${id})`;
        if (await this.isSoftDeletion(req.user.organization_id)) 
            queryCmd = `UPDATE ${table} SET isdeleted = ${id} WHERE id = ${id}`;;
        
        //call query
        let results = await sqlObj.query(queryCmd);
        if (sql.getAffectedFields(results) === 0)
            return await bres.throw(null, bres.ERR_SQL_ID); 

        return bres.status_OK;
    }

    // async replace(req) {
    //     await bres.throw(null, bres.ERR_SQL_BODY);
    // }

    // check if the new field obj meets uniqueness requirement.
    // resolve: duplicate array
    // reject: rejected status
    async checkDuplicate(req) {
        let new_items = req.body.query;
        let tableObj = this;
        if (typeof new_items !== 'object')
            await bres.throw(null, bres.ERR_SQL_BODY);

        let unique_arr = await this.findUniqueCols(req.user.organization_id);
        await Promise.all(unique_arr.map(async element => {
            if (Object.keys(new_items).includes(element.CONSTRAINT_NAME)) {
                let value = '';
                let key = element.CONSTRAINT_NAME;
                if (typeof new_items[key] === 'number')
                    value += `${new_items[key]}, `
                else
                    value += `'${new_items[key]}', `
                
                value = value.slice(0, -2);
                let table = tableBase.getTableName(tableObj.table, req.user.organization_id);
                // find existed records if any
                let queryCmd = `SELECT id FROM ${table} WHERE ${key} = ${value}`;

                // use promise to handle sql connection
                let row_id = await tableObj.sqlObj.query(queryCmd);
                if (sql.getNumOfRows(row_id) > 0 & row_id !== new_items.id) 
                    // push duplicate col to dupliacate array
                    this.dupl_array.push(key);
            }
        }))

        if (this.dupl_array.length !== 0) 
            return await bres.throw(null, bres.ERR_SQL_DUPLICATE);

        return bres.status_OK;       
    }

    // ensure required fields provided
    // resolve: status_OK
    // reject: missing required fields 
    async checkRequired(req) {
        let new_items = req.body.query;
        let tableObj = this;
        if (typeof new_items !== 'object')
            await bres.throw(null, bres.ERR_SQL_BODY);
            
        return this.findRequiredCols(req.user.organization_id)
        .then(required_arr => {
            return Promise.all(required_arr.map(element => {
                if (!Object.keys(new_items).includes(element.COLUMN_NAME)) 
                    tableObj.missing_arr.push(element.COLUMN_NAME);
            }))
        }).then(async () => {
            // resolve
            if (tableObj.missing_arr.length == 0)
                return await bres.throw(null, bres.ERR_SQL_REQUIRED);
            return bres.status_OK;
        });
    }

    // make sure fixed field values are correct
    // resolve: status_OK
    // reject: mismatch array
    async checkFixedFields(req) {
        let new_items = req.body.query;
        let tableObj = this;
        if (typeof new_items !== 'object')
            await bres.throw(null, bres.ERR_SQL_BODY);
        
        if (typeof tableObj.fixed_fields === 'undefined')
            return Promise.resolve(bres.status_OK);

        return Promise.all(Object.keys(new_items).map(async (key) => {
            // if key in fixed_fields
            if (Object.keys(tableObj.fixed_fields).includes(key)) {
                // if new value is not in fixed values
                if (!tableObj.fixed_fields[key].includes(new_items[key]))
                tableObj.mismatch_arr.push(key);
            }
        })).then(async () => {
            if (tableObj.mismatch_arr.length !== 0) 
                return await bres.throw(null, bres.ERR_SQL_MISMATCH);
            return bres.status_OK;
        }) 
    }

    getPromisesOnCreate(req) {
        let promiseList = [];
        for (let i = 0; i < this.promisesOnCreate.length; i++) {
            let promise = this.promisesOnCreate[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(req));
        }
        return promiseList;
    }

    getPromisesOnUpdate(req) {
        let promiseList = [];
        for (let i = 0; i < this.promisesOnUpdate.length; i++) {
            const promise = this.promisesOnUpdate[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(req));
        }
        return promiseList;
    }

    getPromisesAfterRead(results) {
        let promiseList = [];
        for (let i = 0; i < this.promisesAfterRead.length; i++) {
            let promise = this.promisesAfterRead[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(results));
        }
        return promiseList;
    }

    addPromiseOnCreate(callback) {
        this.promisesOnCreate.push(callback);
    }

    addPromiseOnUpdate(callback) {
        this.promisesOnUpdate.push(callback);
    }

    addPromiseAfterRead(callback) {
        this.promisesAfterRead.push(callback);
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
            case bres.getErrcode(bres.ERR_SQL_REQUEST_FIELD):
                data = this.err_field_arr;
                break;
            default:
                break;
        }
        return data;
    }

    async findRequiredCols(organization_id) {
        let table = tableBase.getTableName(this.table, organization_id);
        let queryCmd = `SELECT COLUMN_NAME 
                        FROM information_schema.COLUMNS 
                        WHERE TABLE_SCHEMA='${process.env.DB}' 
                        AND TABLE_NAME='${table}' 
                        AND IS_NULLABLE='NO'
                        AND COLUMN_NAME!='id';`
        
        return this.sqlObj.query(queryCmd).then(results => {
            return Promise.resolve(results);
        });
    }

    async findUniqueCols(organization_id) {
        let table = tableBase.getTableName(this.table, organization_id);
        let queryCmd = `SELECT DISTINCT CONSTRAINT_NAME
                        FROM information_schema.TABLE_CONSTRAINTS
                        where TABLE_SCHEMA='${process.env.DB}' AND 
                        table_name = '${table}' AND 
                        constraint_type = 'UNIQUE';`
        
        return this.sqlObj.query(queryCmd).then(results => {
            return Promise.resolve(results);
        });
    }

    async isSoftDeletion(organization_id) {
        let table = tableBase.getTableName(this.table, organization_id);
        let queryCmd = `SHOW COLUMNS FROM ${table} LIKE 'isdeleted';`;
                        
        let results = await this.sqlObj.query(queryCmd);
        
        return sql.getNumOfRows(results) > 0 ? true: false;
    }

    static getTableName(table, organization_id) {
        // if not shared table, append organization id to table
        let target_table = `${table}_${organization_id}`;
        // check if it is shared table
        for (let i in bconst.sharedTables) {
            if (bconst.sharedTables[i] === table) {
                target_table = `${table}`;
                break;
            }
        }
        return target_table
    }
}

exports.sql = sql;
exports.tableBase = tableBase;