(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-2793"],{"5Ovl":function(e,t,a){},U7nq:function(e,t,a){"use strict";a.d(t,"b",function(){return f}),a.d(t,"e",function(){return g}),a.d(t,"d",function(){return h}),a.d(t,"f",function(){return b}),a.d(t,"c",function(){return v}),a.d(t,"h",function(){return D}),a.d(t,"a",function(){return _}),a.d(t,"g",function(){return k}),a.d(t,"i",function(){return w});var r=a("t3Un"),n="/datatable",o="/analysis",l="/production/plan",i="/role",s="/user/list",u="http://www.bivrost.cn",c="/production/product",m="/production/group",d="/user",p="/chartdata";function f(e){return Object(r.a)({url:u+n,method:"get",params:e})}function g(e,t){return Object(r.a)({url:u+o,method:"post",data:t})}function h(e){return Object(r.a)({url:u+l,method:"post",data:e})}function b(e){return Object(r.a)({url:u+c,method:"post",data:e})}function v(e){return Object(r.a)({url:u+m,method:"post",data:e})}function D(e){return Object(r.a)({url:u+d,method:"post",data:e})}function _(e){return Object(r.a)({url:u+p,method:"post",data:e})}function k(e){return Object(r.a)({url:u+i,method:"post",data:e})}function w(e){return Object(r.a)({url:u+s,method:"post",data:e})}},"gDS+":function(e,t,a){e.exports={default:a("oh+g"),__esModule:!0}},gzcD:function(e,t,a){"use strict";var r=a("5Ovl");a.n(r).a},"oh+g":function(e,t,a){var r=a("WEpk"),n=r.JSON||(r.JSON={stringify:JSON.stringify});e.exports=function(e){return n.stringify.apply(n,arguments)}},q2rJ:function(e,t,a){"use strict";a.r(t);var r=a("gDS+"),n=a.n(r),o=a("U7nq"),l={name:"UserAdmin",data:function(){return{userData:[],roleData:[],totalData:0,currentPage:1,pageSize:20,formOption:{title:"",nameInputAble:!0,mailInputAble:!0,showDeleteBtn:!1,neewPassword:!0},query:{privilege:[]},addTaskDialogVisible:!1,formData:{name:"",email:"@bivrost.cn",nickname:"",phone:"",password:"",gender:"",role:[],department_id:""},formDataModel:{name:"",email:"@bivrost.cn",nickname:"",phone:"",password:"",gender:"",department_id:"",role:[]},loginRules:{name:[{required:!0,trigger:"blur",message:"请输入姓名！"}],mail:[{required:!0,trigger:"blur",message:"请输入邮箱地址！",type:"mail"}],phone:[{required:!0,trigger:"blur",message:"请输入联系方式！"}],password:[{required:!0,trigger:"blur",message:"请输入密码！"}]},privilegeList:{admin:"管理员",analysis:"数据分析",production:"生产管理",user:"用户管理",monitor:"实时监控"}}},beforeMount:function(){this.getUserInfo(),this.getRole()},methods:{getRole:function(){var e=this;Object(o.g)({method:"read",query:{page:1,limit:999}}).then(function(t){e.roleData=t.data.data.results}).catch(function(t){e.$message({message:"数据加载失败！"+t,type:"error"})})},getUserInfo:function(){var e=this;Object(o.h)({method:"read",query:{page:e.currentPage,limit:e.pageSize,privilege:e.query.privilege}}).then(function(t){e.userData=t.data.data.results,e.totalData=t.data.data.total}).catch(function(t){e.$message({message:"数据加载失败！"+t,type:"error"})})},addTaskDialogConfirm:function(){var e=this,t=this,a=JSON.parse(n()(t.formData)),r="create";t.formOption.showDeleteBtn&&(r="update",null===a.nickname&&(a.nickname="")),console.log(a),console.log(t.roleData);var l=function(t){var r=e.roleData.find(function(e){return e.name===a.role[t]});a.role[t]=r.id};for(var i in a.role)l(i);a.role_id=a.role,delete a.role,delete a.department_name,Object(o.h)({method:r,query:a}).then(function(e){t.$message({message:"create"===r?"用户新增成功！":"用户信息更新成功！",type:"success"}),t.getUserInfo(),t.addTaskDialogVisible=!1}).catch(function(e){console.log(e),t.$message({message:"create"===r?"新增失败！"+e:"更新失败！"+e,type:"error"})})},addNewUser:function(){this.formData=this.formDataModel,this.addTaskDialogVisible=!0,this.formOption.showDeleteBtn=!1,this.formOption.needPassword=!0,this.formOption.title="添加新成员",this.loginRules.password[0].required=!0},formDeleteBtn:function(){var e=this;e.$confirm("确定删除？","警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(function(){return Object(o.h)({method:"delete",query:{id:e.formData.id}}).then(function(){e.$message({message:"删除成功！",type:"success"}),e.getUserInfo(),e.addTaskDialogVisible=!1})}).catch(function(t){e.$message({message:"删除失败！"+t,type:"error"})})},selectBtnClick:function(){this.getUserInfo()},cellEditClick:function(e){console.log(e);var t=JSON.parse(n()(e.row));this.formData=t,this.formData.password="",this.addTaskDialogVisible=!0,this.formOption.showDeleteBtn=!0,this.formOption.needPassword=!1,this.loginRules.password[0].required=!1,this.formOption.title="编辑成员信息"},handleSizeChange:function(e){this.pageSize=e,this.getUserInfo()},handleCurrentChange:function(e){this.currentPage=e,this.getUserInfo()}}},i=(a("gzcD"),a("KHd+")),s=Object(i.a)(l,function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"userAdmin"}},[a("el-dialog",{attrs:{visible:e.addTaskDialogVisible,title:e.formOption.title,width:"35%"},on:{"update:visible":function(t){e.addTaskDialogVisible=t}}},[a("el-form",{ref:"form",attrs:{model:e.formData,rules:e.loginRules,"label-width":"120px"}},[a("el-form-item",{attrs:{label:"姓名：",prop:"name"}},[a("el-input",{model:{value:e.formData.name,callback:function(t){e.$set(e.formData,"name",t)},expression:"formData.name"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"邮箱：",prop:"email"}},[a("el-input",{model:{value:e.formData.email,callback:function(t){e.$set(e.formData,"email",t)},expression:"formData.email"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"密码：",prop:"password"}},[a("el-input",{attrs:{type:"password"},model:{value:e.formData.password,callback:function(t){e.$set(e.formData,"password",t)},expression:"formData.password"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"昵称：",prop:"nickname"}},[a("el-input",{model:{value:e.formData.nickname,callback:function(t){e.$set(e.formData,"nickname",t)},expression:"formData.nickname"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"手机号码：",prop:"phone"}},[a("el-input",{model:{value:e.formData.phone,callback:function(t){e.$set(e.formData,"phone",t)},expression:"formData.phone"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"性别："}},[a("el-select",{model:{value:e.formData.gender,callback:function(t){e.$set(e.formData,"gender",t)},expression:"formData.gender"}},[a("el-option",{attrs:{label:"男",value:"male"}}),e._v(" "),a("el-option",{attrs:{label:"女",value:"female"}})],1)],1),e._v(" "),a("el-form-item",{attrs:{label:"权限分组：",prop:"state"}},[a("el-select",{staticStyle:{width:"100%"},attrs:{placeholder:"请选择权限",multiple:""},model:{value:e.formData.role,callback:function(t){e.$set(e.formData,"role",t)},expression:"formData.role"}},e._l(e.roleData,function(e){return a("el-option",{key:e.name,attrs:{label:e.name,value:e.name}})}))],1),e._v(" "),a("el-form-item",{attrs:{label:"部门："}},[a("el-input",{model:{value:e.formData.department_id,callback:function(t){e.$set(e.formData,"department_id",t)},expression:"formData.department_id"}})],1)],1),e._v(" "),a("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{directives:[{name:"show",rawName:"v-show",value:e.formOption.showDeleteBtn,expression:"formOption.showDeleteBtn"}],attrs:{type:"danger"},on:{click:e.formDeleteBtn}},[e._v("删除")]),e._v(" "),a("el-button",{on:{click:function(t){e.addTaskDialogVisible=!1}}},[e._v("取 消")]),e._v(" "),a("el-button",{attrs:{disabled:!e.formData.name||!e.formData.email||!e.formData.phone||!e.formData.password&&e.formOption.needPassword,type:"primary"},on:{click:function(t){e.addTaskDialogConfirm()}}},[e._v("确 定")])],1)],1),a("el-container",[a("el-header",[a("el-row",{staticStyle:{margin:"22px"}},[a("el-col",{attrs:{span:4}},[a("el-select",{attrs:{name:"user",placeholder:"按角色选择",multiple:""},model:{value:e.query.privilege,callback:function(t){e.$set(e.query,"privilege",t)},expression:"query.privilege"}},e._l(e.privilegeList,function(e,t){return a("el-option",{key:t,attrs:{label:e,value:t}})}))],1),e._v(" "),a("el-col",{attrs:{span:4}},[a("el-button",{attrs:{type:"primary",round:""},on:{click:function(t){e.selectBtnClick()}}},[e._v("查询")])],1),e._v(" "),a("el-col",{attrs:{span:4}},[a("div",{staticClass:"grid-content"},[a("el-button",{on:{click:e.addNewUser}},[e._v("添加新成员")])],1)])],1)],1),e._v(" "),a("el-main",[a("el-table",{attrs:{data:e.userData,border:""}},[a("el-table-column",{attrs:{prop:"id",label:"ID"}}),e._v(" "),a("el-table-column",{attrs:{prop:"name",label:"名称"}}),e._v(" "),a("el-table-column",{attrs:{prop:"email",label:"邮箱"}}),e._v(" "),a("el-table-column",{attrs:{prop:"nickname",label:"昵称"}}),e._v(" "),a("el-table-column",{attrs:{prop:"phone",label:"联系方式"}}),e._v(" "),a("el-table-column",{attrs:{label:"权限组"},scopedSlots:e._u([{key:"default",fn:function(t){return e._l(t.row.role,function(t){return a("el-tag",{key:t,attrs:{size:"medium"}},[e._v(e._s(t))])})}}])}),e._v(" "),a("el-table-column",{attrs:{prop:"department_name",label:"部门"}}),e._v(" "),a("el-table-column",{attrs:{label:"操作"},scopedSlots:e._u([{key:"default",fn:function(t){return[a("el-button",{attrs:{type:"text",size:"small"},on:{click:function(a){e.cellEditClick(t)}}},[e._v("编辑")])]}}])})],1)],1),e._v(" "),a("el-footer",[a("el-pagination",{attrs:{"page-sizes":[20,50,100,200],"page-size":e.pageSize,total:e.totalData,"current-page":e.currentPage,layout:"total, sizes, prev, pager, next, jumper"},on:{"size-change":e.handleSizeChange,"current-change":e.handleCurrentChange}})],1)],1)],1)},[],!1,null,"79f65d12",null);s.options.__file="userAdmin.vue";t.default=s.exports}}]);