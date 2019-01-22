'use strict'

const mysql = require('mysql');
const bres = require('./bResponse');

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
        let sqlObj = this;
        sqlObj.pool.getConnection(function(err, connection) {
            if (err) {
                return bres.throw(bres.ERR_SQL_CONNETION);
            }
            
            // Use the connection
            connection.query(queryCmd, (err, results, fields) => {
                // When done with the connection, release it.
                connection.release();
                
                // Handle error after the release.
                if (err) {
                    console.log(err);
                    return bres.throw(bres.ERR_SQL_QUERY);
                }
                // resolve([results, fields]);
                return results;
            
                // Don't use the connection here, it has been returned to the pool.
            });
        })     
    }

    async end() {
        return this.pool.end((err) => {
            if (err) {
                return bres.throw(bres.ERR_SQL_END);
            }
        });
    }

    static async getRow(results, i) {
        if (results.length > i)
            return results[i];
        else 
            bres.throw(bres.ERROR_INDEX_OUT_OF_RANGE);
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
    constructor(table, organization_id){
        this.sqlObj = new sql();
        this.org_id = organization_id;
        this.table = `table@${organization_id}`;
        this.dupl_array = [];
        this.missing_arr = [];
        this.mismatch_arr = [];
        this.err_field_arr = [];
        this.promisesOnCreate = [this.checkDuplicate, this.checkRequired, this.checkFixedFields];
        this.promisesOnUpdate = [this.checkDuplicate, this.checkFixedFields];
    }

    async endSql() {
        return this.sqlObj.end();
    }

    async create(req) {
        let new_items = req.body.query;
        if (typeof new_items !== 'object')
            return bres.throw(bres.ERR_SQL_BODY);
            
        let sqlObj = this.sqlObj;
        let tableObj = this;
        //pre-check promise
        return Promise.all(this.getPromisesOnCreate(req)).then(async () => {
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

    async joinTable() {
        let table = this.table;
        try {
            this.innerjoin.map(join_config => {
                table += ` INNER JOIN ${join_config[0]} ON ${join_config[1]}`;
            })
        } catch (error) {
            return await bres.throw(bres.ERROR);
        }
        
        return table;
    }

    async parseCond(req) {
        let query = req.body.query;
        let skip_keys = ['limit', "page", "order"];
        let conds = "";
        let err_field_arr = this.err_field_arr;
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
                    conds += `${key} IN (${values}) AND`;
                }
                // number: value
                else if (typeof cond === 'number') {
                    conds += `${key} = ${cond} AND`;
                }
                // string
                else if (typeof cond === 'string') {
                    conds += `${key} = '${cond}' AND`;
                }
                // object: range
                else if (typeof cond === 'object') {
                    // {"cond": {"range": [0, 2]}}
                    if (typeof cond.range !== 'undefined') {
                        // check if array
                        if (!Array.isArray(cond.range)) return err_field_arr.push(key);
                        // check if two elements
                        if (cond.range.length !== 2) return err_field_arr.push(key);
                        
                        conds += `${key} >= ${cond.range[0]} AND ${key} <= ${cond.range[1]} AND`;
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
            let allConds = "WHERE ";

            if (this.isSoftDeletion())
                allConds += "isdeleted == 0 AND ";

            // from table setup
            for (let item of this.extraConditions)
                allConds += `${item} AND `;

            if (conds.length !== 0) {
                allConds += conds;          
            }
            // remove the last " AND"
            allConds = allConds.slice(0, -4);
            return conds;
        }
        else {
            bres.throw(bres.ERR_SQL_REQUEST_FIELD);
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
        let select = `${this.table}.*`;

        for (let item in this.join_fields) {
            select += `, ${item}`;
        }

        return select;
    }

    async read(req) {
        let limit = req.body.query.limit || 10;
        let page = req.body.query.page || 1;

        let sqlObj = this.sqlObj;

        let offset = `OFFSET ${limit*(page-1)}`;
        let order = this.orderBy(req);
        let limitStr = `LIMIT ${limit}`;

        let [table, cond, select] = await Promise.all([this.joinTable(), this.parseCond(req), this.selectFields(req)]);

        // compose query command    
        let queryCmd_results = `SELECT ${select} FROM ${table} ${cond} ${order} ${limitStr} ${offset}`;
        let queryCmd_total = `SELECT COUNT(*) FROM ${table} ${cond}`;
        // query database
        let [results, total] = await Promise.all([sqlObj.query(queryCmd_results), sqlObj.query(queryCmd_total)]);
        return {results: results, total: total[0]['COUNT(*)']};
    }

    async update(req) {
        let id = req.body.query.id;
        if (typeof id !== 'number')
            return bres.throw(bres.ERR_SQL_ID);
             
        let new_items = req.body.query;
        if (typeof new_items !== 'object')
            return bres.throw(bres.ERR_SQL_BODY);

        let sqlObj = this.sqlObj;
        let tableObj = this;
        // remote id from new items, id is not needed for pre-checking
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
        
            return sqlObj.query(queryCmd).then(results => {
                if (sql.getAffectedFields(results) == 1)
                    return Promise.resolve(bres.status_OK);
                else
                    return Promise.reject(bres.getErrcode(bres.ERR_SQL_ID));
            })
        })
    }

    async delete(req) {
        let id_array = req.body.query.id;
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
            if (id.length === 0) return bres.throw(bres.ERR_SQL_ID);

            //remove the ending comma and space
            id = id.slice(0, -2);
        }
        else {
            // no id to remove
            if (id.length === 0) return bres.throw(bres.ERR_SQL_ID);
        }

        let queryCmd = `DELETE FROM ${table} WHERE id in (${id})`;
        if (this.isSoftDeletion()) 
            queryCmd = `UPDATE ${table} SET isdeleted = ${id} WHERE id = ${id}`;;
        
        //call query
        return sqlObj.query(queryCmd).then(results => {
            if (sql.getAffectedFields(results) > 0)
                return Promise.resolve(bres.status_OK);
            else
                return Promise.reject(bres.getErrcode(bres.ERR_SQL_ID));  
        });
    }

    // check if the new field obj meets uniqueness requirement.
    // resolve: duplicate array
    // reject: rejected status
    async checkDuplicate (req) {
        new_items = req.body.query;
        let tableObj = this;
        if (typeof new_items !== 'object')
            return bres.throw(bres.ERR_SQL_BODY);

        return this.findUniqueCols().then(unique_arr => {
            return Promise.all(unique_arr.map(element => {
                if (Object.keys(new_items).includes(element.CONSTRAINT_NAME)) {
                    let value = '';
                    let key = element.CONSTRAINT_NAME;
                    if (typeof new_items[key] === 'number')
                        value += `${new_items[key]}, `
                    else
                        value += `'${new_items[key]}', `
                    
                    value = value.slice(0, -2);
                    // find existed records if any
                    let queryCmd = `SELECT id FROM ${tableObj.table} WHERE ${key} = ${value}`;
                    // use promise to handle sql connection
                    return tableObj.sqlObj.query(queryCmd).then(row_id => {
                        // records exist if row number is more than 0 and it is not the current row
                        if (sql.getNumOfRows(row_id) > 0 & row_id !== new_items.id) 
                            // push duplicate col to dupliacate array
                            this.dupl_array.push(key);
                    });
                }
            }))
        }).then(() => {
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
            return bres.throw(bres.ERR_SQL_BODY);
            
        return this.findRequiredCols()
        .then(required_arr => {
            return Promise.all(required_arr.map(element => {
                if (!Object.keys(new_items).includes(element.COLUMN_NAME)) 
                    tableObj.missing_arr.push(element.COLUMN_NAME);
            }))
        }).then(() => {
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
            return bres.throw(bres.ERR_SQL_BODY);
        
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

    getPromisesOnCreate(req) {
        let promiseList = [];
        for (let i = 0; i < this.promisesOnCreate.length; i++) {
            let promise = this.promisesOnCreate[i];
            let boundPromise = promise.bind(this); // important
            promiseList.push(boundPromise(req));
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
            case bres.getErrcode(bres.ERR_SQL_REQUEST_FIELD):
                data = this.err_field_arr;
                break;
            default:
                break;
        }
        return data;
    }

    async findRequiredCols() {
        let queryCmd = `SELECT COLUMN_NAME 
                        FROM information_schema.COLUMNS 
                        WHERE TABLE_SCHEMA='${process.env.DB}' 
                        AND TABLE_NAME='${this.table}' 
                        AND IS_NULLABLE='NO'
                        AND COLUMN_NAME!='id';`
        
        return this.sqlObj.query(queryCmd).then(results => {
            return Promise.resolve(results);
        });
    }

    async findUniqueCols() {
        let queryCmd = `SELECT DISTINCT CONSTRAINT_NAME
                        FROM information_schema.TABLE_CONSTRAINTS
                        where TABLE_SCHEMA='${process.env.DB}' AND 
                        table_name = '${this.table}' AND 
                        constraint_type = 'UNIQUE';`
        
        return this.sqlObj.query(queryCmd).then(results => {
            return Promise.resolve(results);
        });
    }

    async isSoftDeletion() {
        let queryCmd = `SELECT COLUMN_NAME 
                        FROM information_schema.COLUMNS 
                        WHERE TABLE_SCHEMA='${process.env.DB}' 
                        AND TABLE_NAME='${this.table}'
                        AND COLUMN_NAME='isdeleted'`;
                        
        let results = await this.sqlObj.query(queryCmd);
        
        return sql.getNumOfRows(results) > 0 ? true: false;

    }
}

exports.sql = sql;
exports.tableBase = tableBase;