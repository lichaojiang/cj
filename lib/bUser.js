'user strict'

const bcrypt = require('bcrypt');
const tableBase = require('./bDatabaselib').tableBase;
const bres = require('./bResponse');
const sql = require('./bDatabaselib').sql
const bconst = require('./bConstants')

class user extends tableBase {
    constructor(table) {
        super(table);

        this.left_join = [{field: "department_id", target_table: "department", target_reference: "id", target_field: "name"}];
        
        this.redundant_arr = ['password', 'organization_id']; // these items will be ignored in read operation

        // keys that exist in other tables, but needed
        this.extra_keys = ['role'];

        this.fixed_fields = {status: bconst.fixed_fields.gender.forRequest};

        this.success_msg = {created: "User created.", updated: "User updated", deleted: "User deleted."};
        
        this.addPromiseOnCreate(this.init);
        this.addPromiseOnUpdate(this.init);

        this.addPromiseOnCreate(this.hashPassword);
        this.addPromiseOnUpdate(this.hashPassword);

        this.addPromiseOnCreate(this.setOrganizationId);
        this.addPromiseOnUpdate(this.setOrganizationId);

        this.addPromiseAfterRead(this.appendUserRoleToResults);

        this.addPromiseAfterCreate(this.setUserRole);
        this.addPromiseAfterUpdate(this.setUserRole);

        this.addPromiseAfterDelete(this.deleteUserRole);
    }

    async deleteUserRole(req, user_id) {
        let table = tableBase.getTableName('userrole', req.user.organization_id);
        if (!isNaN(user_id)) {
            // delete original user role
            let queryCmd = `DELETE FROM ${table} WHERE user_id = ${user_id}`;
            await this.sqlObj.query(queryCmd);
        }
        else if (Array.isArray(user_id)) {
            if (user_id.length === 0) return 

            let cond = "";
            for (let id of user_id) {
                cond += `id, `;
            }
            cond = cond.slice(0, -2);
            let queryCmd = `DELETE FROM ${table} WHERE user_id in (${cond})`;
            await this.sqlObj.query(queryCmd);
        }
    }

    async appendUserRoleToResults(req, results) {
        if (!req.user.privilege.includes('admin'))
            return

        if (sql.getNumOfRows(results) > 0) {
            await Promise.all(results.map(async (result) => {
                let role = await this.getUserRoles(result.id, req.user.organization_id);
                result.role = role;
            }));
        }
    }

    // return a role array containing all roles belonging to a user
    async getUserRoles(user_id, organization_id) {
        let user_role_table = tableBase.getTableName('userrole', organization_id);
        let role_table = tableBase.getTableName('role', organization_id);

        let role_id_cmd = `SELECT role_id FROM ${user_role_table} WHERE user_id = ${user_id}`;
        let queryCmd = `SELECT name FROM ${role_table} WHERE id in (${role_id_cmd})`;

        let roles = await this.sqlObj.query(queryCmd);

        let role_arr = [];
        if (sql.getNumOfRows(roles) > 0) {
            for (let role_i of roles) {
                role_arr.push(role_i.name);
            }
        }
        
        return role_arr;
    }

    // force value on organization id 
    async setOrganizationId(req) {
        let organization_id = req.user.organization_id
        if (typeof organization_id === 'undefined')
            await bres.throw(null, bres.ERR_USER);
        req.body.query.organization_id = req.user.organization_id
    }

    // set variables to class object
    async init(req) {
        this.role = req.body.query.role;
        this.user_id = req.body.query.id;
        delete req.body.query.role;
    }

    async setUserRole(req) {
        if (!req.user.privilege.includes('admin') & !req.user.privilege.includes('user'))
            return

        let role = this.role
        if (role) {
            let organization_id = req.user.organization_id;
            let table = tableBase.getTableName('userrole', organization_id);

            // get user id
            let user_id = this.user_id;
            if (typeof user_id === 'undefined') {
                let user_table = tableBase.getTableName('user', organization_id);
                let query_id = `SELECT id FROM ${user_table} WHERE ${bconst.usernameMethod} = '${req.body.query[bconst.usernameMethod]}'`;
                let results = await this.sqlObj.query(query_id);
                let result = await sql.getRow(results, 0);
                user_id = result.id;
            }

            // delete original user role
            let queryCmd = `DELETE FROM ${table} WHERE user_id = ${user_id}`;
            await this.sqlObj.query(queryCmd);

            // create new user role
            let insert_values = "";
            if (!isNaN(role)) {
                insert_values = `(${user_id}, ${role}), `;
            }
            else if (Array.isArray(role)){
                for (let role_i of role) {
                    if (isNaN(role_i)) continue;
                    insert_values += `(${user_id}, ${role_i}), `;
                }
            }

            // no id to remove
            if (insert_values.length === 0) await bres.throw(null, bres.ERR_SQL_BODY);

            //remove the ending comma and space
            insert_values = insert_values.slice(0, -2);

            // create new user role
            queryCmd = `INSERT INTO ${table} (user_id, role_id) VALUES ${insert_values}`;
            let results = await this.sqlObj.query(queryCmd);

            if (sql.getAffectedFields(results) === 0)
                return await bres.throw(null, bres.ERR_SQL_QUERY);
        }
        return bres.status_OK;
    }

    async hashPassword(req) {
        let new_items = req.body.query;
        if (typeof new_items.password === 'undefined')
            await bres.throw(null, bres.ERR_USER_PASSWD);

        const saltRounds = 10;

        return new Promise((resolve, reject) => {
            bcrypt.hash(new_items.password, saltRounds, async (err, hash) => {
                if (err)
                    return await bres.throw(reject, bres.ERR_USER_HASH)
                
                new_items.password = hash;
                resolve();
            });
        })
    }

    async selectFields(req) {
        let table = tableBase.getTableName(this.table, req.user.organization_id);
        let select = `${table}.*`
        if (!req.user.privilege.includes('admin'))
            select = `${table}.id, ${table}.name, ${table}.email, ${table}.phone`;
        
        // add join fields
        if (this.left_join) {
            for (let join of this.left_join) {
                let target_table = tableBase.getTableName(join.target_table, req.user.organization_id);
                select += `, ${target_table}.${join.target_field} AS ${join.target_table}_${join.target_field}`;
            }
        }

        return select;
    }
    
    static async getUserInfo(user_id, organization_id) {
        let userTable = new user('user');
        let selected = `${userTable.table}.id, email, ${userTable.table}.name, nickname, phone, gender, organization_id, department_id`;

        // get info from user table
        let queryCmd = `SELECT ${selected} FROM ${userTable.table} WHERE ${userTable.table}.id = ${user_id}`;
        let userInfo = await userTable.sqlObj.query(queryCmd);
        userInfo = await sql.getRow(userInfo, 0);

        // get user roles
        userInfo['role'] = await userTable.getUserRoles(user_id, organization_id);

        let org_table = bconst.sharedTables.organization;
        let department_table = tableBase.getTableName("department", organization_id);
        // get info from organization, department, role tables
        selected = `${org_table}.included_modules,
                    ${org_table}.name AS organization,
                    ${department_table}.name AS department`

        queryCmd = `SELECT ${selected} FROM ${org_table}, department_${organization_id}
                    WHERE ${org_table}.id = ${userInfo.organization_id}
                    AND ${department_table}.id = ${userInfo.department_id}`;

        let otherInfo = await userTable.sqlObj.query(queryCmd);
        otherInfo = await sql.getRow(otherInfo, 0);
        
        // add other info to user info
        for (let info in otherInfo) {
            userInfo[info] = otherInfo[info];
        }

        await userTable.endSql();
        
        return userInfo;
    }

    static async verifyUser(username, password, done) {
        let userObj = new user('user');

        let queryCmd = `SELECT id, password, organization_id FROM ${userObj.table} WHERE email="${username}"`;
        let results = await userObj.sqlObj.query(queryCmd);

        let num_row = await sql.getNumOfRows(results);
        if (num_row === 0) {
            done(null, false);
        }
        else {
            let userCred = await sql.getRow(results, 0);
            const hash = userCred.password;

            await new Promise((resolve, reject) => {
                bcrypt.compare(password, hash, async (err, response) => {
                    if (err) await bres.throw(reject, bres.ERR_USER_HASH);
    
                    if (response === false) {
                        return done(null, false);
                    }
                    else {
                        try {
                            let privilege = [];
                            let userInfo = await user.getUserInfo(userCred.id, userCred.organization_id);
                            // get user privilege
                            if (userInfo.role.length > 0) {
                                let cond = "";
                                for (let role_i of userInfo.role) {
                                    cond += `name = '${role_i}' OR `;
                                }
                                cond = cond.slice(0, -4);
        
                                let role_table = tableBase.getTableName('role', userCred.organization_id);
                                let query_privileges = `SELECT privilege FROM ${role_table} WHERE ${cond}`;
        
                                results = await userObj.sqlObj.query(query_privileges);
                                if (sql.getNumOfRows(results) > 0) {
                                    for (let results_i of results) {
                                        let priv_arr = results_i.privilege.split(',');
                                        for (let priv_i of priv_arr) {
                                            if (!privilege.includes(priv_i) & priv_i !== "") {
                                                privilege.push(priv_i);
                                            }
                                        }
                                    }
                                }
                            }
        
                            return done(null, {user_id: userInfo.id, organization_id: userInfo.organization_id, privilege: privilege});       
                        } catch (err) {
                            done(null, false);
                            await bres.throw(reject, err);
                        }                    
                    }
                });
            })
        }
        await userObj.endSql();
    }
}

class chartData extends tableBase {
    constructor(table) {
        super(table);
        this.promisesOnCreate = [this.setUserId];
        this.promisesOnUpdate = [this.setUserId]
        this.success_msg = {created: "Chart data created.", updated: "Chart data updated", deleted: "Chart data deleted."};
    }

    async setUserId(req) {
        let new_items = req.body.query;
        if (typeof new_items !== 'object')
            return (bres.ERR_SQL_BODY);
        
        new_items.user_id = req.user.user_id;
        return Promise.resolve();
    }
}

class role extends tableBase {
    constructor(table) {
        super(table);

        this.fixed_fields = {status: bconst.fixed_fields.privilege.forRequest};
        this.success_msg = {created: "Role created.", updated: "Role updated", deleted: "Role deleted."};

        this.addPromiseOnCreate(this.init);
        this.addPromiseOnUpdate(this.init);

        this.addPromiseAfterCreate(this.setUserRole);
        this.addPromiseAfterUpdate(this.setUserRole);

        this.addPromiseAfterRead(this.appendUserRoleToResults);
    }

    // set variables to class object
    async init(req) {
        this.user = req.body.query.user;
        this.role_id = req.body.query.id;
        delete req.body.query.user;
    }

    async appendUserRoleToResults(req, results) {
        if (!req.user.privilege.includes('admin'))
            return

        if (sql.getNumOfRows(results) > 0) {
            await Promise.all(results.map(async (result) => {
                let user_id = await this.getUserRoles(result.id, req.user.organization_id);
                result.user_id = user_id;
            }));
        }
    }

    // return a role array containing all roles belonging to a user
    async getUserRoles(role_id, organization_id) {
        let user_role_table = tableBase.getTableName('userrole', organization_id);
        // let user_table = tableBase.getTableName('user', organization_id);

        let user_id_cmd = `SELECT user_id FROM ${user_role_table} WHERE role_id = ${role_id}`;
        // let queryCmd = `SELECT id FROM ${user_table} WHERE id in (${user_id_cmd})`;

        let users = await this.sqlObj.query(user_id_cmd);

        let user_id_arr = [];
        if (sql.getNumOfRows(users) > 0) {
            for (let user_i of users) {
                user_id_arr.push(user_i.user_id);
            }
        }
        
        return user_id_arr;
    }

    async setUserRole(req) {
        if (!req.user.privilege.includes('admin') & !req.user.privilege.includes('user'))
            return

        let user = this.user;
        if (user) {
            let organization_id = req.user.organization_id;
            let table = tableBase.getTableName('userrole', organization_id);

            // get user id
            let role_id = this.role_id;
            if (!role_id) {
                let role_table = tableBase.getTableName('role', organization_id);
                let query_id = `SELECT id FROM ${role_table} WHERE name = '${req.body.query.name}'`;
                let results = await this.sqlObj.query(query_id);
                let result = await sql.getRow(results, 0);
                role_id = result.id;
            }

            // delete original user role
            let queryCmd = `DELETE FROM ${table} WHERE role_id = ${role_id}`;
            await this.sqlObj.query(queryCmd);

            // create new user role
            let insert_values = "";
            if (!isNaN(user)) {
                insert_values = `(${user}, ${role_id}), `;
            }
            else if (Array.isArray(user)){
                for (let user_i of user) {
                    if (isNaN(user_i)) continue;
                    insert_values += `(${user_i}, ${role_id}), `;
                }
            }

            // no id to remove
            if (insert_values.length === 0) await bres.throw(null, bres.ERR_SQL_BODY);

            //remove the ending comma and space
            insert_values = insert_values.slice(0, -2);

            // create new user role
            queryCmd = `INSERT INTO ${table} (user_id, role_id) VALUES ${insert_values}`;
            let results = await this.sqlObj.query(queryCmd);

            if (sql.getAffectedFields(results) === 0)
                return await bres.throw(null, bres.ERR_SQL_QUERY);
        }
        return bres.status_OK;
    }
}

exports.user = user;
exports.chartData = chartData;
exports.role = role;