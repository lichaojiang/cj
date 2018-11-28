var mysqlConn=require("./mysqlConn");
//查
let sql ="select * from Production where id=?";
let data = null;
mysqlConn.consql(sql,data,(result)=>{

    console.log(result);
});
