var mysql = require('mysql');

exports.consql=(sql, data, callback) =>{

    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        port: '3306',
        database: 'test'
    });

    //执行连接
    connection.connect();

    //执行数据库操作
    connection.query(sql, data, (err, result) => {
        if (err) throw err;
        callback(result);
    });

    //关闭数据库
    connection.end();
}

