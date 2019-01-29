const bres = require('./bResponse');

// options: tableClass, tableName
// function crud(options) {
function crud(tableName, tableCls, readOnly=false) {
    return async (req, res, next) => {
        let tableObj = new tableCls(tableName, readOnly);
        switch(req.body.method)
        {
            case "create":
                if (readOnly == true) 
                    return next(await bres.throw(null, bres.ERR_ACCESS_DENIED));

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
                tableObj.read(req).then((results) => {
                    return tableObj.endSql().then(() => {
                        return Promise.resolve(results)
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
                if (readOnly == true) 
                    return next(await bres.throw(null, bres.ERR_ACCESS_DENIED));

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
                if (readOnly == true) 
                    return next(await bres.throw(null, bres.ERR_ACCESS_DENIED));
                    
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