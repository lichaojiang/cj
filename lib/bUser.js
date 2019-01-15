const bcrypt = require('bcrypt');
const bTableBase = require('./bDatabaselib').tableBase;
const bres = require('./bResponse');
const sql = require('./bDatabaselib').sql
const bconst = require('./bConstants')

const saltRounds = 10;

class user extends bTableBase {
    constructor(table) {
        super(table);
        this.success_msg = {created: "User created.", updated: "User updated", deleted: "User deleted."};
        
        this.addPromiseOnCreate(this.hashPassword);
        this.addPromiseOnUpdate(this.hashPassword);
    }

    hashPassword(new_items) {
        if (typeof new_items.password === 'undefined')
            return Promise.reject(bres.getErrcode(bres.ERR_USER_PASSWD));

        return new Promise((resolve, reject) => {
            return bcrypt.hash(new_items.password, saltRounds, (err, hash) => {
                if (err)
                    reject(bres.getErrcode(bres.ERR_USER_PASSWD));
                
                new_items.password = hash;
                resolve();
            });
        })
    }

    async verifyUser(username, password, done) {
        let queryCmd = `SELECT id, password FROM ${this.table} WHERE email="${username}"`;
        return this.sqlObj.query(queryCmd).then(onResolved => {
            let results = onResolved[0];
            return sql.getRow(results, 0).then(userInfo => {
                const hash = userInfo.password;
                return bcrypt.compare(password, hash, (err, response) => {
                    if (err) return Promise.reject(bres.getErrcode(bres.ERR_USER_HASH));

                    if (response === false)
                        return done(null, false);
                    else
                        return done(null, {user_id: userInfo.id});
                });
            })
        }).then(() => {
            return this.endSql();
        })
    }

    async getUserInfo(user_id, callback) {
        let selected = `${this.table}.id, email, ${this.table}.name, privilege,role, department, nickname, phone, gender,
                        ${bconst.organizationTable}.id AS organization_id, included_tables, ${bconst.organizationTable}.name AS organization`;
        let queryCmd = `SELECT ${selected} FROM ${this.table}, ${bconst.organizationTable} WHERE ${this.table}.id = ${user_id} AND ${bconst.organizationTable}.id = ${this.table}.organization_id`;
        return this.sqlObj.query(queryCmd).then(onResolved => {
            let results = onResolved[0];
            return sql.getRow(results, 0).then(userInfo => {
                return callback(userInfo)
            });
    }).then(() => {
        return this.endSql();
    })}

    read(req) {
        let organization_id = req.user.organization_id;
        if (typeof organization_id === 'undefined')
            return Promise.reject(bres.getErrcode(bres.ERR_USER));

        let limit = req.body.query.limit || 10;
        let page = req.body.query.page || 1;
        let order = this.orderBy(req);

        let sqlObj = this.sqlObj;
        let table = this.table;
        let offset = `OFFSET ${limit*(page-1)}`;
        let limitStr = `LIMIT ${limit}`;

        // compose query command
        let queryCmd = `SELECT id, name FROM ${this.table} WHERE organization_id = ${organization_id} ${order} ${limitStr} ${offset}`;
        // call query
        return sqlObj.query(queryCmd).then(onResolved => {
            return Promise.resolve(onResolved[0]);
        }).then(results => {
            queryCmd = `SELECT COUNT(*) FROM ${table} WHERE organization_id = ${organization_id}`;
            return sqlObj.query(queryCmd).then(onResolved => {
                return Promise.resolve({results: results, total: onResolved[0][0]['COUNT(*)']});
            })
        })
    }
    
}

class chartData extends bTableBase {
    constructor(table) {
        super(table);
        this.promisesOnCreate = [this.checkDuplicate, this.checkFixedFields];
        this.success_msg = {created: "Chart data created.", updated: "Chart data updated", deleted: "Chart data deleted."};
    }

    create(req) {
        let new_items = req.body.query;
        if (typeof new_items !== 'object')
            return Promise.reject(bres.getErrcode(bres.ERR_SQL_BODY));
        
        new_items.user_id = req.user.id;
        new_items.times = 0;
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
}

exports.user = user;
exports.chartData = chartData;