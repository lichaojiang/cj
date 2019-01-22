'user strict'

const bcrypt = require('bcrypt');
const bTableBase = require('./bDatabaselib').tableBase;
const bres = require('./bResponse');
const sql = require('./bDatabaselib').sql
const bconst = require('./bConstants')

class user extends bTableBase {
    constructor(table) {
        super(table);
        
        this.table = table; // reset to 'user' table

        this.join_fields = [`department@${this.org_id}.name AS department_name`,
                            `role@${this.org_id}.name AS role_name`];
        this.innerjoin = [[`department@${this.org_id}`, `${this.table}.department_id = department@${this.org_id}.id`],
                          [`role@${this.org_id}`, `${this.table}.role_id = role@${this.org_id}.id`]];

        this.extraConditions = [`organization_id = ${this.org}`];

        this.success_msg = {created: "User created.", updated: "User updated", deleted: "User deleted."};
        
        this.addPromiseOnCreate(this.hashPassword);
        this.addPromiseOnUpdate(this.hashPassword);

        this.addPromiseOnCreate(this.setOrganizationId);
        this.addPromiseOnUpdate(this.setOrganizationId);
    }

    // force value on organization id 
    setOrganizationId(req) {
        let organization_id = req.user.organization_id
        if (typeof organization_id === 'undefined')
            return bres.throw(bres.ERR_USER);
        req.body.query.organization_id = req.user.organization_id
    }

    hashPassword(req) {
        let new_items = req.body.query;
        if (typeof new_items.password === 'undefined')
            return bres.throw(bres.ERR_USER_PASSWD);

        return new Promise((resolve, reject) => {
            const saltRounds = 10;
            return bcrypt.hash(new_items.password, saltRounds, (err, hash) => {
                if (err)
                    reject(bres.getErrcode(bres.ERR_USER_PASSWD));
                
                new_items.password = hash;
                resolve();
            });
        })
    }

    async verifyUser(username, password, done) {
        let queryCmd = `SELECT id, password, organization_id FROM ${this.table} WHERE email="${username}"`;
        return this.sqlObj.query(queryCmd).then(results => {
            return sql.getRow(results, 0).then(userInfo => {
                const hash = userInfo.password;
                return bcrypt.compare(password, hash, (err, response) => {
                    if (err) return bres.throw(bres.ERR_USER_HASH);

                    if (response === false)
                        return done(null, false);
                    else
                        return done(null, {user_id: userInfo.id, organization_id: userInfo.organization_id});
                });
            })
        }).then(() => {
            return this.endSql();
        })
    }

    async selectFields(req) {
        let select = `${this.table}.*`
        if (!req.user.privilege.includes('admin'))
            select = "id, name, email, phone";

        for (let item in this.join_fields) {
            select += `, ${item}`;
        }

        return select;
    }
    
    static async getUserInfo(user_id) {
        let userTable = new user('user');
        let selected = `${userTable.table}.id, email, ${userTable.table}.name, privilege,role, department, nickname, phone, gender,
                        ${bconst.organizationTable}.id AS organization_id, included_tables, ${bconst.organizationTable}.name AS organization`;
        let queryCmd = `SELECT ${selected} FROM ${userTable.table}, ${bconst.organizationTable} WHERE ${userTable.table}.id = ${user_id} AND ${bconst.organizationTable}.id = ${userTable.table}.organization_id`;

        let results;
        try {
            results = await sqlObj.query(queryCmd);
            userTable.endSql();
            let userInfo = await sql.getRow(results, 0);
            return userInfo;
        } catch (err) {
            return Promise.reject(err)
        }  
    }
}

class chartData extends bTableBase {
    constructor(table) {
        super(table);
        this.promisesOnCreate = [this.checkDuplicate, this.checkFixedFields, this.setUserId];
        this.promisesOnUpdate = [this.setUserId]
        this.success_msg = {created: "Chart data created.", updated: "Chart data updated", deleted: "Chart data deleted."};
    }

    async setUserId(req) {
        let new_items = req.body.query;
        if (typeof new_items !== 'object')
            return (bres.ERR_SQL_BODY);
        
        new_items.use_id = req.user.user_id;
        return Promise.resolve();
    }
}

exports.user = user;
exports.chartData = chartData;