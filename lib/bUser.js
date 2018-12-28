const bcrypt = require('bcrypt');
const bTableBase = require('./bDatabaselib').tableBase;
const bres = require('./bResponse');

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
            const hash = results[0].password;
            const id = results[0].id;
            if (results.length === 0) {
                return Promise.resolve('fail');
            }
            else {
                return bcrypt.compare(password, hash, (err, response) => {
                    if (err) return Promise.reject(bres.getErrcode(bres.ERR_USER_HASH));

                    if (response === false)
                        done(null, false);
                    else
                        done(null, {user_id: id});
                });
            }
        })
    }
}

class chartData extends bTableBase {
    constructor(table) {
        super(table);
        this.success_msg = {created: "Chart data created.", updated: "Chart data updated", deleted: "Chart data deleted."};
    }
}

exports.user = user;
exports.chartData = chartData;