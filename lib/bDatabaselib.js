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
                    console.log(queryCmd);
                    return await bres.throw(reject, bres.ERR_SQL_CONNETION)
                }
                
                // Use the connection
                connection.query(queryCmd, async (err, results, fields) => {
                    // When done with the connection, release it.
                    connection.release();
                    
                    // Handle error after the release.
                    if (err) {
                        console.log(queryCmd);
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
            await bres.throw(null, bres.ERROR_INDEX_OUT_OF_RANGE);
    }

    static getNumOfRows(results) {
        if (results)
            return results.length;
        else
            return 0;
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
        this.err_field_extra_filter = [];

        // overwrite this array in children class if unintended data need to be removed from results
        this.redundant_arr = [];

        this.promisesOnCreate = [this.checkDuplicate, this.checkRequired, this.checkFixedFields];
        this.promisesAfterCreate = [];
        this.promisesOnUpdate = [this.checkDuplicate, this.checkFixedFields];
        this.promisesAfterUpdate = [];
        this.promisesAfterRead = [this.removeRedundantData, this.extraFilter];
        this.promisesAfterDelete = [];
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
            }).then(async () => {
                await Promise.all(this.getPromisesAfterCreate(req));
            })
        })
    }

    async joinTable(req) {
        let this_table = tableBase.getTableName(this.table, req.user.organization_id);
        let joined = this_table;
        try {
            if (this.left_join) {
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
        if (this.extra_keys) {
            skip_keys.concat(this.extra_keys);
        }
        let conds = "";
        let err_field_arr = this.err_field_arr;
        let this_table = tableBase.getTableName(this.table, req.user.organization_id);
        Object.keys(query).map(key => {
            let cond = query[key];
            if (!skip_keys.includes(key) & cond) {
                conds += tableBase.parseCond_I(this_table, key, cond, err_field_arr, tableBase.parseCond_array, 
                    tableBase.parseCond_number, tableBase.parseCond_string, tableBase.parseCond_object_range);
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
        if (req.body.query.order) {
            let set = req.body.query.order;
            order = `ORDER BY ${set[0]} ${set[1]}`;
        }
        return order
    }

    async selectFields(req) {
        let this_table = tableBase.getTableName(this.table, req.user.organization_id);
        let select = `${this_table}.*`;

        if (this.left_join) {
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
        for (let field of redundant_arr) {
            for (let result_i of results) {
                delete result_i[field];
            }
        }
    }

    async extraFilter(req, results) {
        let result_size = await sql.getNumOfRows(results);
        if (result_size == 0) return
        if (!this.extra_keys) return

        let query = req.body.query;
        if (!query) return

        // loop through extra_keys
        for (let key of this.extra_keys) {
            let cond = query[key];
            if (!cond) continue;
            
            // loop through results
            for (let i=0; i<results.length; i++) {
                let result_i = results[i];
                // check if result contains certain key
                if (result_i[key]) continue;

                // collect result if it satisfies conditions
                let isPassed = tableBase.parseCond_I(result_i, key, cond, this.err_field_extra_filter, 
                    tableBase.extraFilter_array, tableBase.extraFilter_num_str, tableBase.extraFilter_num_str, tableBase.extraFilter_object_range);

                if (this.err_field_extra_filter.length > 0) {
                    return await bres.throw(null, bres.ERR_SQL_REQUEST_FIELD)
                }

                if (!isPassed) {
                    results.splice(i, 1);
                }
            }
        }
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

        await Promise.all(this.getPromisesAfterRead(req, results));
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

        await Promise.all(this.getPromisesOnUpdate(req));

        // remote id from new items, id is not needed for pre-checking
        delete new_items.id;

        let table = tableBase.getTableName(tableObj.table, req.user.organization_id);
        let updates = '';
        Object.keys(new_items).forEach((key) => {
            if (typeof new_items[key] === 'number')
                updates += `${key} = ${new_items[key]}, `
            else
                updates += `${key} = "${new_items[key]}", `
        });

        if (updates.length !== 0) {
            //remove the ending comma and space
            updates = updates.slice(0, -2);
        
            // compose query command
            let queryCmd = `UPDATE ${table} SET ${updates} WHERE id = ${id}`;
            let results = await sqlObj.query(queryCmd);

            if (sql.getAffectedFields(results) !== 1)
                return await bres.throw(null, bres.ERR_SQL_ID);
        }

        await Promise.all(this.getPromisesAfterUpdate(req));

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

        await Promise.all(this.getPromisesAfterDelete(req, id_array));
        return bres.status_OK;
    }

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
                if (sql.getNumOfRows(row_id) > 0)
                    if (row_id[0].id !== new_items.id)
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
            if (tableObj.missing_arr.length !== 0)
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

    getPromisesAfterCreate(req) {
        let promiseList = [];
        for (let i = 0; i < this.promisesAfterCreate.length; i++) {
            let promise = this.promisesAfterCreate[i];
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

    getPromisesAfterUpdate(req) {
        let promiseList = [];
        for (let i = 0; i < this.promisesAfterUpdate.length; i++) {
            const promise = this.promisesAfterUpdate[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(req));
        }
        return promiseList;
    }

    getPromisesAfterRead(req, results) {
        let promiseList = [];
        for (let i = 0; i < this.promisesAfterRead.length; i++) {
            let promise = this.promisesAfterRead[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(req, results));
        }
        return promiseList;
    }

    getPromisesAfterDelete(req, results) {
        let promiseList = [];
        for (let i = 0; i < this.promisesAfterDelete.length; i++) {
            let promise = this.promisesAfterDelete[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(req, results));
        }
        return promiseList;
    }

    addPromiseOnCreate(callback) {
        this.promisesOnCreate.push(callback);
    }

    addPromiseAfterCreate(callback) {
        this.promisesAfterCreate.push(callback);
    }

    addPromiseOnUpdate(callback) {
        this.promisesOnUpdate.push(callback);
    }

    addPromiseAfterUpdate(callback) {
        this.promisesAfterUpdate.push(callback);
    }

    addPromiseAfterRead(callback) {
        this.promisesAfterRead.push(callback);
    }

    addPromiseAfterDelete(callback) {
        this.promisesAfterDelete.push(callback);
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
                data = data.concat(this.err_field_extra_filter);
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

    static parseCond_array(table, key, cond) {
        if (cond.length === 0) return ""

        let values = "";
        cond.map(value => {
            if (typeof value === 'number')
                values += `${value}, `;
            else 
                values += `'${value}', `;
        })
        values = values.slice(0, -2);
        return `${table}.${key} IN (${values}) AND`;
    }

    static parseCond_number(table, key, cond) {
        return `${table}.${key} = ${cond} AND`;
    }

    static parseCond_string(table, key, cond) {
        return `${table}.${key} = '${cond}' AND`;
    }

    static parseCond_object_range(table, key, cond) {
        return `${table}.${key} >= ${cond.range[0]} AND ${table}.${key} <= ${cond.range[1]} AND`;
    }

    static parseCond_I(info, key, cond, err_field_arr, arrayHandler, numberHandler, stringHandler, objectHandler_range) {
        // array: values
        if (Array.isArray(cond)) {
            return arrayHandler(info, key, cond);
        }
        // number: value
        else if (typeof cond === 'number') {
            return numberHandler(info, key, cond);
        }
        // string
        else if (typeof cond === 'string') {
            return stringHandler(info, key, cond);
        }
        // object: range
        else if (typeof cond === 'object') {
            if (cond.range) {
                // check if array
                if (!Array.isArray(cond.range)) return err_field_arr.push(key);
                // check if two elements
                if (cond.range.length !== 2) return err_field_arr.push(key);
                
                return objectHandler_range(info, key, cond);
            }
            // not supported
            else {
                err_field_arr.push(key);
            }
        }
        // not supported
        else {
            return err_field_arr.push(cond);
        }
    }

    static extraFilter_array(result, key, cond) {
        let isPassed = false;
        for (let cond_i of cond) {
            if (result[key].includes(cond_i)) {
                isPassed = true;
                break
            }
        }
        return isPassed
    }

    static extraFilter_num_str(result, key, cond) {
        let isPassed = false;
        if (result[key] === cond) 
            isPassed = true;
        return isPassed
    }

    static extraFilter_object_range(result, key, cond) {
        let isPassed = false;
        let min = cond.range[0];
        let max = cond.range[1];

        if (result[key] >= min & result[key] <= max)
            isPassed = true;

        return isPassed
    }
}

exports.sql = sql;
exports.tableBase = tableBase;