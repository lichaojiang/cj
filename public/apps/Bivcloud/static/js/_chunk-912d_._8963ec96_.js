(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-912d"],{CVxG:function(t,e,a){"use strict";var r=a("iV0o");a.n(r).a},LRJY:function(t,e,a){"use strict";a.r(e);var r=a("gDS+"),n=a.n(r),o=a("U7nq"),l={name:"ProjectDetails",data:function(){return{fieldRules:"({title:['名称','input'],product_name:['产品名称','select','product'],quantity:['数量','number'],begin:['开始日期','datePick'],end:['结束日期','datePick'],assignee_id:['负责人','select','user'],status:['状态','select'],note:['备注','textArea']})",productPlanData:[],formOption:{title:"",showDeleteBtn:!1},totalData:0,currentPage:1,pageSize:20,addTaskDialogVisible:!1,productPlanQueryList:[],userData:{},productData:{},formData:{title:"",code:"",product_id:"",quantity:"",assignee_id:"",status:"",note:"",begin:"",end:""},formDataModel:{title:"",code:"",product_id:"",quantity:"",assignee_id:"",status:"",note:"",begin:"",end:""},planStatus:{waiting:"未开始",working:"生产中",complete:"已完成",delayed:"延期"},request:{method:"read",query:{page:1,limit:20,product_id:"",assignee_id:"",status:"",order:["updated_at","DESC"]}},loginRules:{title:[{required:!0,trigger:"blur",message:"请输入名称！"}],code:[{required:!0,trigger:"blur",message:"请输入代码！"}],product:[{required:!0,trigger:"blur",message:"请选择产品！"}],begin:[{required:!0,trigger:"blur",message:"请选择日期！"}],end:[{required:!0,trigger:"blur",message:"请选择正确的结束日期！"}],state:[{required:!0,trigger:"blur",message:"请选择状态！"}],user:[{required:!0,trigger:"blur",message:"请选择负责人！"}]}}},computed:{finalfieldRules:function(){return this.evil(this.fieldRules)}},watch:{productPlanData:function(){var t=this,e=function(e){var a=t.userData.results.find(function(a){return a.id===t.productPlanData[e].assignee_id}),r=t.productPlanData[e].quantity.toLocaleString();t.productPlanData[e].begin=t.productPlanData[e].begin.split("T")[0],t.productPlanData[e].end=t.productPlanData[e].end.split("T")[0],t.productPlanData[e].assignee_id=a.name,t.productPlanData[e].status=t.planStatus[t.productPlanData[e].status],t.productPlanData[e].quantity=r};for(var a in this.productPlanData)e(a)}},created:function(){var t=this;Object(o.h)({method:"read",query:{page:1,limit:999}}).then(function(e){return t.userData=e.data.data,Object(o.f)({method:"read",query:{page:1,limit:999}}).then(function(e){t.productData=e.data.data,t.getProductPlanData()})}).catch(function(e){console.log(e),t.$message({message:"数据加载失败！"+e,type:"error"}),t.laoding=!1})},methods:{tableSortChange:function(t){t.order&&(this.request.query.order[0]=t.prop,this.request.query.order[1]="asc"===t.order.slice(0,3)?"ASC":"DESC",this.getProductPlanData())},evil:function(t){return new Function("return "+t)()},handleSizeChange:function(t){this.pageSize=t},handleCurrentChange:function(t){this.currentPage=t},selectBtnClick:function(){this.getProductPlanData()},addTaskDialogConfirm:function(){var t=this;Object(o.d)({method:"create",query:t.formData}).then(function(e){t.$message({message:"项目新增成功！!",type:"success"}),t.getProductPlanData(),t.addTaskDialogVisible=!1}).catch(function(e){t.$message({message:"新增失败!!"+e,type:"error"}),t.laoding=!1})},getProductPlanData:function(){var t=this;t.loading=!0,Object(o.d)(t.request).then(function(e){t.productPlanData=e.data.data.results,t.totalData=e.data.data.total,t.loading=!1}).catch(function(e){t.$message({message:"request failed"+e,type:"error"}),t.laoding=!1})},addNewPlan:function(){this.formData=this.formDataModel,this.addTaskDialogVisible=!0,this.formOption.showDeleteBtn=!1,this.formOption.title="添加新计划"},cellEditClick:function(t){var e=JSON.parse(n()(t.row));this.formData=e,this.addTaskDialogVisible=!0,this.formOption.showDeleteBtn=!0,this.formOption.title="编辑计划"},formDeleteBtn:function(){var t=this;t.$confirm("确定删除？","警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(function(){return Object(o.d)({method:"delete",query:{id:t.formData.id}}).then(function(){t.$message({message:"删除成功！",type:"success"}),t.getProductPlanData()})}).catch(function(e){t.$message({message:"删除失败！"+e,type:"error"})})}}},i=(a("CVxG"),a("KHd+")),s=Object(i.a)(l,function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticStyle:{height:"100%"},attrs:{id:"projectDetails"}},[a("el-dialog",{attrs:{visible:t.addTaskDialogVisible,title:t.formOption.title,width:"35%"},on:{"update:visible":function(e){t.addTaskDialogVisible=e}}},[a("el-form",{ref:"form",attrs:{model:t.formData,rules:t.loginRules,"label-width":"120px"}},[a("el-form-item",{attrs:{label:"名称：",prop:"title"}},[a("el-input",{model:{value:t.formData.title,callback:function(e){t.$set(t.formData,"title",e)},expression:"formData.title"}})],1),t._v(" "),a("el-form-item",{attrs:{label:"代码：",prop:"code"}},[a("el-input",{attrs:{type:"number"},model:{value:t.formData.code,callback:function(e){t.$set(t.formData,"code",e)},expression:"formData.code"}})],1),t._v(" "),a("el-form-item",{attrs:{label:"产品：",prop:"product"}},[a("el-select",{attrs:{placeholder:"请选择产品"},model:{value:t.formData.product_id,callback:function(e){t.$set(t.formData,"product_id",e)},expression:"formData.product_id"}},t._l(t.productData.results,function(t){return a("el-option",{key:t.id,attrs:{label:t.name,value:t.id}})}))],1),t._v(" "),a("el-form-item",{attrs:{label:"数量：",prop:"number"}},[a("el-input",{attrs:{type:"number"},model:{value:t.formData.quantity,callback:function(e){t.$set(t.formData,"quantity",e)},expression:"formData.quantity"}})],1),t._v(" "),a("el-form-item",{attrs:{label:"项目时间：",prop:"begin"}},[a("el-col",{attrs:{span:8}},[a("el-date-picker",{staticStyle:{width:"100%"},attrs:{"value-format":"yyyy-MM-dd",type:"date",placeholder:"开始日期"},model:{value:t.formData.begin,callback:function(e){t.$set(t.formData,"begin",e)},expression:"formData.begin"}})],1),t._v(" "),a("el-col",{staticClass:"line",staticStyle:{"text-align":"center"},attrs:{span:2}},[t._v("-")]),t._v(" "),a("el-col",{attrs:{span:8}},[a("el-date-picker",{staticStyle:{width:"100%"},attrs:{"value-format":"yyyy-MM-dd",type:"date",placeholder:"结束日期"},model:{value:t.formData.end,callback:function(e){t.$set(t.formData,"end",e)},expression:"formData.end"}})],1)],1),t._v(" "),a("el-form-item",{attrs:{label:"负责人：",prop:"user"}},[a("el-select",{attrs:{placeholder:"请选择负责人"},model:{value:t.formData.assignee_id,callback:function(e){t.$set(t.formData,"assignee_id",e)},expression:"formData.assignee_id"}},t._l(t.userData.results,function(t){return a("el-option",{key:t.id,attrs:{label:t.name,value:t.id}})}))],1),t._v(" "),a("el-form-item",{attrs:{label:"状态：",prop:"state"}},[a("el-select",{attrs:{placeholder:"请选择状态"},model:{value:t.formData.status,callback:function(e){t.$set(t.formData,"status",e)},expression:"formData.status"}},t._l(t.planStatus,function(t,e){return a("el-option",{key:e,attrs:{label:t,value:e}})}))],1),t._v(" "),a("el-form-item",{attrs:{label:"备注："}},[a("el-input",{attrs:{type:"textarea"},model:{value:t.formData.note,callback:function(e){t.$set(t.formData,"note",e)},expression:"formData.note"}})],1)],1),t._v(" "),a("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{directives:[{name:"show",rawName:"v-show",value:t.formOption.showDeleteBtn,expression:"formOption.showDeleteBtn"}],attrs:{type:"danger"},on:{click:t.formDeleteBtn}},[t._v("删除")]),a("el-button",{on:{click:function(e){t.addTaskDialogVisible=!1}}},[t._v("取 消")]),t._v(" "),a("el-button",{attrs:{disabled:!(t.formData.assignee_id&&t.formData.begin&&t.formData.quantity&&t.formData.title&&t.formData.code&&t.formData.status),type:"primary"},on:{click:function(e){t.addTaskDialogConfirm()}}},[t._v("确 定")])],1)],1),a("el-container",{staticStyle:{height:"100%"},attrs:{direction:"vertical"}},[a("el-header",[a("el-row",{staticStyle:{margin:"22px"}},[a("el-col",{attrs:{span:4}},[a("el-select",{attrs:{clearable:"",placeholder:"请选择产品"},model:{value:t.request.query.product_id,callback:function(e){t.$set(t.request.query,"product_id",e)},expression:"request.query.product_id"}},t._l(t.productData.results,function(t){return a("el-option",{key:t.id,attrs:{label:t.name,value:t.id}})}))],1),t._v(" "),a("el-col",{attrs:{span:4}},[a("el-select",{attrs:{name:"user",placeholder:"请选择负责人"},model:{value:t.request.query.assignee_id,callback:function(e){t.$set(t.request.query,"assignee_id",e)},expression:"request.query.assignee_id"}},t._l(t.userData.results,function(t){return a("el-option",{key:t.id,attrs:{label:t.name,value:t.id}})}))],1),t._v(" "),a("el-col",{attrs:{span:4}},[a("el-select",{attrs:{name:"state",placeholder:"请选择状态"},model:{value:t.request.query.status,callback:function(e){t.$set(t.request.query,"status",e)},expression:"request.query.status"}},t._l(t.planStatus,function(t,e){return a("el-option",{key:e,attrs:{label:t,value:e}})}))],1),t._v(" "),a("el-col",{attrs:{span:4}},[a("el-button",{attrs:{type:"primary",round:""},on:{click:function(e){t.selectBtnClick()}}},[t._v("查询")])],1),t._v(" "),a("el-col",{attrs:{span:4}},[a("div",{staticClass:"grid-content"},[a("el-button",{on:{click:t.addNewPlan}},[t._v("添加新项目")])],1)])],1)],1),t._v(" "),a("el-main",[a("el-table",{staticClass:"show-table",attrs:{data:t.productPlanData,border:""},on:{"sort-change":t.tableSortChange}},[t._l(t.finalfieldRules,function(t,e){return a("el-table-column",{key:e,attrs:{prop:e,label:t[0],sortable:"custom"}})}),t._v(" "),a("el-table-column",{attrs:{label:"操作"},scopedSlots:t._u([{key:"default",fn:function(e){return[a("el-button",{attrs:{type:"text",size:"small"},on:{click:function(a){t.cellEditClick(e)}}},[t._v("编辑")])]}}])})],2)],1),t._v(" "),a("el-footer",[a("el-pagination",{attrs:{"page-sizes":[20,50,100,200],"page-size":t.pageSize,total:t.totalData,"current-page":t.currentPage,layout:"total, sizes, prev, pager, next, jumper"},on:{"size-change":t.handleSizeChange,"current-change":t.handleCurrentChange}})],1)],1)],1)},[],!1,null,"a7f7522e",null);s.options.__file="projectDetails.vue";e.default=s.exports},U7nq:function(t,e,a){"use strict";a.d(e,"b",function(){return m}),a.d(e,"e",function(){return g}),a.d(e,"d",function(){return D}),a.d(e,"f",function(){return b}),a.d(e,"c",function(){return h}),a.d(e,"h",function(){return y}),a.d(e,"a",function(){return v}),a.d(e,"g",function(){return _}),a.d(e,"i",function(){return k});var r=a("t3Un"),n="/datatable",o="/analysis",l="/production/plan",i="/role",s="/user/list",u="http://www.bivrost.cn",c="/production/product",d="/production/group",p="/user",f="/chartdata";function m(t){return Object(r.a)({url:u+n,method:"get",params:t})}function g(t,e){return Object(r.a)({url:u+o,method:"post",data:e})}function D(t){return Object(r.a)({url:u+l,method:"post",data:t})}function b(t){return Object(r.a)({url:u+c,method:"post",data:t})}function h(t){return Object(r.a)({url:u+d,method:"post",data:t})}function y(t){return Object(r.a)({url:u+p,method:"post",data:t})}function v(t){return Object(r.a)({url:u+f,method:"post",data:t})}function _(t){return Object(r.a)({url:u+i,method:"post",data:t})}function k(t){return Object(r.a)({url:u+s,method:"post",data:t})}},"gDS+":function(t,e,a){t.exports={default:a("oh+g"),__esModule:!0}},iV0o:function(t,e,a){},"oh+g":function(t,e,a){var r=a("WEpk"),n=r.JSON||(r.JSON={stringify:JSON.stringify});t.exports=function(t){return n.stringify.apply(n,arguments)}}}]);