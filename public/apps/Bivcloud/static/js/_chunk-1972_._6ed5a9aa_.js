(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-1972"],{"4H/c":function(t,e,a){"use strict";a.r(e);var o=a("gDS+"),r=a.n(o),n=a("U7nq"),i={name:"ProductManage",data:function(){return{datas:"",showFields:"({code:'代码',name:'名称'})",addTaskDialogVisible:!1,productData:[],totalData:0,currentPage:1,pageSize:20,formData:{code:"",name:""},formDataModel:{code:"",name:""},formOption:{title:"",showDeleteBtn:!1,neewPassword:!0},request:{method:"read",query:{page:1,limit:20,productgroup_id:""}},groupData:{},rules:{code:[{required:!0,trigger:"blur",message:"请输入代码！"}],group:[{required:!0,trigger:"blur",message:"请选择分组！"}],name:[{required:!0,trigger:"blur",message:"请输入名称！"}]}}},computed:{finalShowFields:function(){return this.evil(this.showFields)}},watch:{productData:function(){var t=this,e=function(e){var a=t.groupData.results.find(function(a){return a.id===t.productData[e].productgroup_id});t.productData[e].productgroup_id=a.name};for(var a in this.productData)e(a)}},beforeMount:function(){var t=this;Object(n.c)({method:"read",query:{page:1,limit:999}}).then(function(e){t.groupData=e.data.data,t.getProductData()}).catch(function(e){t.$message({message:"数据加载失败！"+e,type:"error"}),t.laoding=!1})},methods:{evil:function(t){return new Function("return "+t)()},selectBtnClick:function(){this.getProductData()},addTaskDialogConfirm:function(){var t=this,e=JSON.parse(r()(t.formData)),a="create";t.formOption.showDeleteBtn&&(a="update",delete e.updated_at,delete e.created_at),Object(n.f)({method:a,query:e}).then(function(e){t.$message({message:"create"===a?"产品新增成功！":"产品信息更新成功！",type:"success"}),t.getProductData(),t.addTaskDialogVisible=!1}).catch(function(e){console.log(e),t.$message({message:"create"===a?"新增失败！"+e:"更新失败！"+e,type:"error"}),t.laoding=!1}),this.getProductData()},formDeleteBtn:function(){var t=this;t.$confirm("确定删除？","警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(function(){return Object(n.f)({method:"delete",query:{id:t.formData.id}}).then(function(){t.$message({message:"删除成功！",type:"success"}),t.getProductData(),t.addTaskDialogVisible=!1})}).catch(function(e){t.$message({message:"删除失败！"+e,type:"error"})})},getProductData:function(){var t=this;t.loading=!0,Object(n.f)(t.request).then(function(e){t.productData=e.data.data.results,t.totalData=e.data.data.total,t.loading=!1,t.$message({message:"产品加载成功!",type:"success"})}).catch(function(e){console.log(e),t.$message({message:"request failed",type:"error"}),t.laoding=!1}),t.addTaskDialogVisible=!1},cellEditClick:function(t){var e=JSON.parse(r()(t.row));this.formData=e,this.addTaskDialogVisible=!0,this.formOption.showDeleteBtn=!0,this.formOption.title="编辑产品信息"},addNewProduct:function(){this.formData=this.formDataModel,this.addTaskDialogVisible=!0,this.formOption.showDeleteBtn=!1,this.formOption.title="添加新产品"},handleSizeChange:function(t){this.pageSize=t,this.getProductData()},handleCurrentChange:function(t){this.currentPage=t,this.getProductData()}}},s=(a("XOAt"),a("KHd+")),u=Object(s.a)(i,function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{attrs:{id:"produceManage"}},[a("el-dialog",{attrs:{visible:t.addTaskDialogVisible,title:t.formOption.title,width:"35%"},on:{"update:visible":function(e){t.addTaskDialogVisible=e},click:t.addNewProduct}},[a("el-form",{ref:"form",attrs:{model:t.formData,rules:t.rules,"label-width":"120px"}},[a("el-form-item",{attrs:{label:"代码：",prop:"code"}},[a("el-input",{model:{value:t.formData.code,callback:function(e){t.$set(t.formData,"code",e)},expression:"formData.code"}})],1),t._v(" "),a("el-form-item",{attrs:{label:"产品名称：",prop:"name"}},[a("el-input",{model:{value:t.formData.name,callback:function(e){t.$set(t.formData,"name",e)},expression:"formData.name"}})],1)],1),t._v(" "),a("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{directives:[{name:"show",rawName:"v-show",value:t.formOption.showDeleteBtn,expression:"formOption.showDeleteBtn"}],attrs:{type:"danger"},on:{click:t.formDeleteBtn}},[t._v("删除")]),t._v(" "),a("el-button",{on:{click:function(e){t.addTaskDialogVisible=!1}}},[t._v("取 消")]),t._v(" "),a("el-button",{attrs:{disabled:!t.formData.code||!t.formData.name,type:"primary"},on:{click:function(e){t.addTaskDialogConfirm()}}},[t._v("确 定")])],1)],1),t._v(" "),a("el-container",[a("el-header"),t._v(" "),a("el-header",[a("el-row",[a("el-col",{attrs:{span:4}},[a("el-select",{attrs:{clearable:"",placeholder:"请选择分组"},model:{value:t.request.query.productgroup_id,callback:function(e){t.$set(t.request.query,"productgroup_id",e)},expression:"request.query.productgroup_id"}},t._l(t.groupData.results,function(t){return a("el-option",{key:t.id,attrs:{label:t.name,value:t.id}})}))],1),t._v(" "),a("el-col",{attrs:{span:4}},[a("el-button",{attrs:{type:"primary",round:""},on:{click:function(e){t.selectBtnClick()}}},[t._v("查询")])],1),t._v(" "),a("el-col",{attrs:{span:4,offset:8}},[a("div",{staticClass:"grid-content"},[a("el-button",{on:{click:function(e){t.addTaskDialogVisible=!0}}},[t._v("添加新产品")])],1)])],1)],1),t._v(" "),a("el-main",[a("el-table",{staticStyle:{width:"100%"},attrs:{data:t.productData,border:""}},[t._l(t.finalShowFields,function(t,e){return a("el-table-column",{key:e,attrs:{prop:e,label:t}})}),t._v(" "),a("el-table-column",{attrs:{label:"操作"},scopedSlots:t._u([{key:"default",fn:function(e){return[a("el-button",{attrs:{type:"text",size:"small"},on:{click:function(a){t.cellEditClick(e)}}},[t._v("编辑")])]}}])})],2)],1),t._v(" "),a("el-footer",[a("el-pagination",{attrs:{"page-sizes":[20,50,100,200],"page-size":t.pageSize,total:t.totalData,"current-page":t.currentPage,layout:"total, sizes, prev, pager, next, jumper"},on:{"size-change":t.handleSizeChange,"current-change":t.handleCurrentChange}})],1)],1)],1)},[],!1,null,"4b1aa2bc",null);u.options.__file="productManage.vue";e.default=u.exports},JSqT:function(t,e,a){},U7nq:function(t,e,a){"use strict";a.d(e,"b",function(){return g}),a.d(e,"e",function(){return h}),a.d(e,"j",function(){return b}),a.d(e,"d",function(){return D}),a.d(e,"f",function(){return v}),a.d(e,"c",function(){return w}),a.d(e,"h",function(){return _}),a.d(e,"a",function(){return k}),a.d(e,"g",function(){return y}),a.d(e,"i",function(){return O});var o=a("t3Un"),r="/datatable",n="/analysis",i="/analysis/variable",s="/production/plan",u="/role",c="/user/list",l="http://www.bivrost.cn",d="/production/product",f="/production/group",p="/user",m="/chartdata";function g(t){return Object(o.a)({url:l+r,method:"get",params:t})}function h(t,e){return Object(o.a)({url:l+n,method:"post",data:e})}function b(t){return Object(o.a)({url:l+i,method:"post",data:t})}function D(t){return Object(o.a)({url:l+s,method:"post",data:t})}function v(t){return Object(o.a)({url:l+d,method:"post",data:t})}function w(t){return Object(o.a)({url:l+f,method:"post",data:t})}function _(t){return Object(o.a)({url:l+p,method:"post",data:t})}function k(t){return Object(o.a)({url:l+m,method:"post",data:t})}function y(t){return Object(o.a)({url:l+u,method:"post",data:t})}function O(t){return Object(o.a)({url:l+c,method:"post",data:t})}},XOAt:function(t,e,a){"use strict";var o=a("JSqT");a.n(o).a},"gDS+":function(t,e,a){t.exports={default:a("oh+g"),__esModule:!0}},"oh+g":function(t,e,a){var o=a("WEpk"),r=o.JSON||(o.JSON={stringify:JSON.stringify});t.exports=function(t){return r.stringify.apply(r,arguments)}}}]);