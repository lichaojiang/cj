'use strict'

const mysql = require('mysql');
const bres = require('./bResponse');
const bUtil = require('./bUtils');


class sql {
    constructor(res, connLimit=10) {
        this.res = res;
        this.errHandler = bUtil.errHandler(res);
        this.pool  = mysql.createPool({
            connectionLimit : connLimit,
            host            : 'admin.bivrost.cn',
            user            : 'process.env.DB_USER',
            password        : 'process.env.DB_PASSWORD',
            database        : 'bivloud'
        });
    }
    
    query(queryCmd, callback) {
        pool.getConnection(function(err, connection) {
            if (this.errHandler.catch(err, bres.ERR_SQL_CONNETION)) return
            
            // Use the connection
            connection.query(queryCmd, (err, results, fields) => {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                this.errHandler.catch(err, bres.ERR_SQL_RELEASE);

                // on sucess
                callback(results, fields);
            
                // Don't use the connection here, it has been returned to the pool.
            });
        })    
    }

    queryOk() {
        bres.send(this.res, null, bres.status_OK);
    }

    end() {
        this.pool.end((err) => {
            this.errHandler.catch(err, bres.ERR_SQL_END);            
        });
    }
}

exports.sql = sql;