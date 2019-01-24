'user strict'

const bcrypt = require('bcrypt');
const tableBase = require('./bDatabaselib').tableBase;
const bres = require('./bResponse');
const sql = require('./bDatabaselib').sql
const bconst = require('./bConstants')

class user extends tableBase {
    constructor(table) {
        super(table, null);

        this.left_join = [{field: "department_id", target_table: "department", target_reference: "id", target_field: "name"}];

        this.fixed_fields = {status: bconst.fixed_fields.gender.forRequest};
        this.success_msg = {created: "User created.", updated: "User updated", deleted: "User deleted."};
        
        this.addPromiseOnCreate(this.hashPassword);
        this.addPromiseOnUpdate(this.hashPassword);

        this.addPromiseOnCreate(this.setOrganizationId);
        this.addPromiseOnUpdate(this.setOrganizationId);

        this.addPromiseOnCreate(this.setUserRole);
        this.addPromiseOnUpdate(this.setUserRole);

        this.addPromiseAfterRead(this.appendUserRoleToResults);
    }

    async appendUserRoleToResults(req, results) {
        if (!req.user.privilege.includes('admin')) return

        if (await sql.getNumOfRows(results) > 0) {
            for (let result_i of results) {
                let user_id = result_i.id;
                
                result_i.role = await user.getUserRoles(user_id, req.user.organization_id);
            }
        }
    }

    // force value on organization id 
    async setOrganizationId(req) {
        let organization_id = req.user.organization_id
        if (typeof organization_id === 'undefined')
            await bres.throw(null, bres.ERR_USER);
        req.body.query.organization_id = req.user.organization_id
    }

    async setUserRole(req) {
        let role = req.body.query.role
        if (typeof role !== 'undefined') {
            let user_id = req.user.user_id;
            let organization_id = req.user.organization_id;
            let table = tableBase.getTableName('userrole', organization_id);

            // delete original user role
            let queryCmd = `DELETE FROM ${table} WHERE user_id = ${user_id}`;
            await this.sqlObj.query(queryCmd);

            // create new user role
            let insert_values = "";
            if (!isNaN(role)) {
                insert_values = `(${user_id}, ${role})`;
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
            insert_values = id.slice(0, -2);

            // create new user role
            let queryCmd = `INSERT INTO ${table} (user_id, role_id) VALUES ${insert_values}`;
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
        if (typeof this.left_join !== "undefined") {
            this.left_join.forEach(join => {
                let target_table = tableBase.getTableName(join.target_table, req.user.organization_id);
                select += `, ${target_table}.${join.target_field} AS ${join.target_table}_${join.target_field}`;
            })
        }

        return select;
    }

    // return a role array containing all roles belonging to a user
    static async getUserRoles(user_id, organization_id) {
        let user_role_table = tableBase.getTableName('userrole', organization_id);
        let role_table = tableBase.getTableName('role', organization_id);

        let role_id_cmd = `SELECT role_id FROM ${user_role_table} WHERE user_id = ${user_id}`;
        let queryCmd = `SELECT name from ${role_table} WHERE id in (${role_id_cmd})`;

        let roles = await this.sqlObj.query(queryCmd);

        let role_arr = [];
        if (sql.getNumOfRows(roles) > 0) {
            for (let role_i of roles) {
                role_arr.push(role_i.name);
            }
        }

        return role_arr
    }
    
    static async getUserInfo(user_id, organization_id) {
        let userTable = new user('user');
        let selected = `${userTable.table}.id, email, ${userTable.table}.name, nickname, phone, gender, organization_id, department_id`;

        // get info from user table
        let queryCmd = `SELECT ${selected} FROM ${userTable.table} WHERE ${userTable.table}.id = ${user_id}`;
        let userInfo = await userTable.sqlObj.query(queryCmd);
        userInfo = await sql.getRow(userInfo, 0);

        // get user roles
        userInfo['role'] = await user.getUserRoles(user_id, organization_id);

        let org_table = bconst.sharedTables.organization;
        let department_table = userTable.getTableName("department", organization_id);
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
        await userObj.endSql();

        let num_row = await sql.getNumOfRows(results);
        if (num_row === 0) {
            done(null, false);
        }
        else {
            let userCred = await sql.getRow(results, 0);
            const hash = userCred.password;
            bcrypt.compare(password, hash, async (err, response) => {
                if (err) await bres.throw(null, bres.ERR_USER_HASH);

                if (response === false) {
                    return done(null, false);
                }
                else {
                    let privilege = [];
                    let userInfo = await user.getUserInfo(userCred.id, userCred.organization_id);

                    // get user privilege
                    if (userInfo.role.length > 0) {
                        let cond = "";
                        userInfo.role.forEach(role => {
                            cond += `name = ${role} OR `
                        })
                        cond.slice(0, -4);

                        let role_table = tableBase.getTableName('role', userCred.organization_id)
                        let query_privileges = `SELECT privilege FROM ${role_table} WHERE ${cond}`;

                        results = await userObj.sqlObj.query(query_privileges);
                        if (sql.getNumOfRows(results) > 0) {
                            for (let results_i of results) {
                                if (!privilege.includes(results_i.privilege)) {
                                    privilege.push(results_i.privilege);
                                }
                            }
                        }
                    }

                    return done(null, {user_id: userInfo.id, organization_id: userInfo.organization_id, privilege: privilege});
                }
            });
        }
    }
}

// class userrole extends tableBase {
//     constructor(table) {
//         super(table);

//         this.success_msg = {created: "Create operation is not allowed. Use replaced instead.",
//                             updated: "Create operation is not allowed. Use replaced instead.",
//                             deleted: "Create operation is not allowed. Use replaced instead.",
//                             replaced: "User role replaced"};
//     }

//     create(req) {
//         return Promise.resolve(bres.status_OK);
//     }

//     update(req) {
//         return Promise.resolve(bres.status_OK);
//     }

//     delete(req) {
//         return Promise.resolve(bres.status_OK);
//     }

//     replace(req) {

//     }
// }

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

exports.user = user;
exports.chartData = chartData;
// exports.userrole = userrole;