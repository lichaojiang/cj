const bres = require('./bResponse');

// options: tableClass, tableName
function crud(options) {
    return (req, res, next) => {
        let tableObj = new options.tableClass(options.tableName);
        switch(req.body.method)
        {
            case "create":
                tableObj.create(req).then(() => {
                    return tableObj.endSql();
                }).then(() => {
                    let data = tableObj.success_msg.created || 'Created.';
                    bres.send(res, data, bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    let data = tableObj.getDataFromStatus(err_status);
                    console.log(err_status);
                    console.log(err.stack);
                    bres.send(res, data, err_status);
                });
                break;
            case "read":
                tableObj.read(req).then((resolvedResults) => {
                    return tableObj.endSql().then(() => {
                        return Promise.resolve(resolvedResults)
                    });
                }).then((results) => {
                    bres.send(res, results, bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    let data = tableObj.getDataFromStatus(err_status);
                    console.log(err_status);
                    console.log(err.stack);
                    bres.send(res, data, err_status);
                });
                break;
            case "update":
                tableObj.update(req).then(() => {
                    return tableObj.endSql();
                }).then(() => {
                    let data = tableObj.success_msg.updated || 'Updated.';
                    bres.send(res, data, bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    let data = tableObj.getDataFromStatus(err_status);
                    console.log(err_status);
                    console.log(err.stack);
                    bres.send(res, data, err_status);
                });
                break;
            case "delete":
                tableObj.delete(req).then(() => {
                    return tableObj.endSql();
                }).then(() => {
                    let data = tableObj.success_msg.deleted || 'Deleted.';
                    bres.send(res, data, bres.status_OK);
                }).catch(err => {
                    let err_status = bres.findStatus(err);
                    let data = tableObj.getDataFromStatus(err_status);
                    console.log(err_status);
                    console.log(err.stack);
                    bres.send(res, data, err_status);
                });
                break;
            default:
                break;
        }
    } 
}

module.exports = crud;