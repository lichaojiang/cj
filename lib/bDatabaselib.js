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

exports.sql = sql;