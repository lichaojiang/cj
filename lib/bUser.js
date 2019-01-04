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
        let selected = `${this.table}.id,email,${this.table}.name,privilege,role,department,nickname,phone,gender,${bconst.organizationTable}.name AS organization,included_tables`;
        let queryCmd = `SELECT ${selected} FROM ${this.table}, ${bconst.organizationTable} WHERE ${this.table}.id = ${user_id} AND ${bconst.organizationTable}.id = ${this.table}.organization_id`;
        return this.sqlObj.query(queryCmd).then(onResolved => {
            let results = onResolved[0];
            return sql.getRow(results, 0).then(userInfo => {
                return callback(userInfo)
            });
    }).then(() => {
        return this.endSql();
    })}

    /*
    read(){

    }
    */
}

class chartData extends bTableBase {
    constructor(table) {
        super(table);
        this.success_msg = {created: "Chart data created.", updated: "Chart data updated", deleted: "Chart data deleted."};
    }
}

exports.user = user;
exports.chartData = chartData;