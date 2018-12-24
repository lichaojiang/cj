const bDb = require('./bDatabaselib')
const bres = require('./bResponse');

// options: tableClass, tableName
function crud(options) {
    return (req, res, next) => {
        let sqlObj = new bDb.sql(res);
        let tableObj = new options.tableClass(sqlObj, options.tableName);

        switch(req.body.method)
        {
            case "create":
                tableObj.create(req.body.query).then(() => {
                    return sqlObj.end();
                }).then(() => {
                    let data = tableObj.success_msg.created || 'Created.';
                    bres.send(res, data, bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    let data = tableObj.getDataFromStatus(err_status);
                    console.log(err_status);
                    console.log(err);
                    bres.send(res, data, err_status);
                });
                break;
            case "read":
                let limit = req.body.query.limit || 10;
                let page = req.body.query.page || 1;
                let results = {};
                tableObj.read(limit, page).then((resolvedResults) => {
                    results = resolvedResults;
                    return sqlObj.end();
                }).then(() => {
                    bres.send(res, results, bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    let data = tableObj.getDataFromStatus(err_status);
                    console.log(err_status);
                    console.log(err);
                    bres.send(res, data, err_status);
                });
                break;
            case "update":
                let id = req.body.query.id;
                if (typeof id !== 'number') {
                    bres.send(res, null, bres.ERR_SQL_ID);
                }
                else {
                    tableObj.update(req.body.query).then(() => {
                        return sqlObj.end();
                    }).then(() => {
                        let data = tableObj.success_msg.updated || 'Updated.';
                        bres.send(res, data, bres.status_OK);
                    }).catch(err => {
                        let err_status = bres.findStatus(err);
                        let data = tableObj.getDataFromStatus(err_status);
                        console.log(err_status);
                        console.log(err);
                        bres.send(res, data, err_status);
                    });
                }
                break;
            case "delete":
                let id_arr = req.body.query.id;
                tableObj.delete(id_arr).then(() => {
                    return sqlObj.end();
                }).then(() => {
                    let data = tableObj.success_msg.deleted || 'Deleted.';
                    bres.send(res, data, bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    let data = tableObj.getDataFromStatus(err_status);
                    console.log(err_status);
                    console.log(err);
                    bres.send(res, data, err_status);
                });
                break;
            default:
                break;
        }
    } 
}

module.exports = crud;