(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-35ff"],{"8KyY":function(t,e,a){"use strict";var o=a("wgqH");a.n(o).a},HwEd:function(t,e,a){"use strict";a.r(e);var o=a("U7nq"),r={name:"productManage",data:function(){return{datas:"",showFields:"({code:'代码',productgroup_id:'分组',name:'名称'})",addTaskDialogVisible:!1,productData:[],totalData:0,currentPage:1,pageSize:20,formData:{code:"",productgroup_id:"",name:""},request:{method:"read",query:{page:1,limit:20}},groupData:{},rules:{code:[{required:!0,trigger:"blur",message:"请输入代码！"}],group:[{required:!0,trigger:"blur",message:"请选择分组！"}],name:[{required:!0,trigger:"blur",message:"请输入名称！"}]}}},computed:{finalShowFields:function(){return this.evil(this.showFields)}},beforeMount:function(){var t=this;Object(o.c)({method:"read",query:{page:1,limit:999}}).then(function(e){t.groupData=e.data.data,t.getProductData()}).catch(function(e){console.log(e),t.$message({message:"数据加载失败！"+e,type:"error"}),t.laoding=!1})},methods:{evil:function(t){return new Function("return "+t)()},selectBtnClick:function(){this.getProductData()},addTaskDialogConfirm:function(){var t=this;Object(o.f)({method:"create",query:t.formData}).then(function(e){t.$message({message:"产品新增成功！!",type:"success"})}).catch(function(e){console.log(e),t.$message({message:"新增失败！"+e,type:"error"}),t.laoding=!1}),this.getProductData()},getProductData:function(){var t=this;t.loading=!0,Object(o.f)(t.request).then(function(e){t.productData=e.data.data.results,t.totalData=e.data.data.total,t.loading=!1,t.$message({message:"产品加载成功!",type:"success"})}).catch(function(e){console.log(e),t.$message({message:"request failed",type:"error"}),t.laoding=!1}),t.addTaskDialogVisible=!1},handleSizeChange:function(t){this.pageSize=t},handleCurrentChange:function(t){this.currentPage=t}}},n=(a("8KyY"),a("KHd+")),i=Object(n.a)(r,function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{attrs:{id:"produceManage"}},[a("el-dialog",{attrs:{visible:t.addTaskDialogVisible,title:"添加新产品",width:"35%"},on:{"update:visible":function(e){t.addTaskDialogVisible=e}}},[a("el-form",{ref:"form",attrs:{model:t.formData,rules:t.rules,"label-width":"120px"}},[a("el-form-item",{attrs:{label:"代码：",prop:"code"}},[a("el-input",{attrs:{type:"number"},model:{value:t.formData.code,callback:function(e){t.$set(t.formData,"code",e)},expression:"formData.code"}})],1),t._v(" "),a("el-form-item",{attrs:{label:"分组：",prop:"group"}},[a("el-select",{attrs:{placeholder:"请选择分组"},model:{value:t.formData.productgroup_id,callback:function(e){t.$set(t.formData,"productgroup_id",e)},expression:"formData.productgroup_id"}},t._l(t.groupData.results,function(t){return a("el-option",{key:t.id,attrs:{label:t.name,value:t.id}})}))],1),t._v(" "),a("el-form-item",{attrs:{label:"产品名称：",prop:"name"}},[a("el-input",{model:{value:t.formData.name,callback:function(e){t.$set(t.formData,"name",e)},expression:"formData.name"}})],1)],1),t._v(" "),a("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:function(e){t.addTaskDialogVisible=!1}}},[t._v("取 消")]),t._v(" "),a("el-button",{attrs:{disabled:!t.formData.code||!t.formData.name||!t.formData.productgroup_id,type:"primary"},on:{click:function(e){t.addTaskDialogConfirm()}}},[t._v("确 定")])],1)],1),t._v(" "),a("el-container",[a("el-header"),t._v(" "),a("el-header",[a("el-row",[a("el-col",{attrs:{span:4}},[a("el-select",{attrs:{placeholder:"请选择分组"}},t._l(t.groupData.results,function(t){return a("el-option",{key:t.id,attrs:{label:t.name,value:t.id}})}))],1),t._v(" "),a("el-col",{attrs:{span:4}},[a("el-button",{attrs:{type:"primary",round:""},on:{click:function(e){t.selectBtnClick()}}},[t._v("查询")])],1),t._v(" "),a("el-col",{attrs:{span:4,offset:8}},[a("div",{staticClass:"grid-content"},[a("el-button",{on:{click:function(e){t.addTaskDialogVisible=!0}}},[t._v("添加新产品")])],1)])],1)],1),t._v(" "),a("el-main",[a("el-table",{staticStyle:{width:"100%"},attrs:{data:t.productData}},t._l(t.finalShowFields,function(t,e){return a("el-table-column",{key:e,attrs:{prop:e,label:t}})}))],1),t._v(" "),a("el-footer",[a("el-pagination",{attrs:{"page-sizes":[20,50,100,200],"page-size":t.pageSize,total:t.totalData,"current-page":t.currentPage,layout:"total, sizes, prev, pager, next, jumper"},on:{"size-change":t.handleSizeChange,"current-change":t.handleCurrentChange}})],1)],1)],1)},[],!1,null,"3af836ea",null);i.options.__file="productManage.vue";e.default=i.exports},U7nq:function(t,e,a){"use strict";a.d(e,"b",function(){return p}),a.d(e,"e",function(){return f}),a.d(e,"d",function(){return g}),a.d(e,"f",function(){return m}),a.d(e,"c",function(){return h}),a.d(e,"g",function(){return b}),a.d(e,"a",function(){return D});var o=a("t3Un"),r="/datatable",n="/plot",i="/production/plan",l="http://www.bivrost.cn",u="/production/product",s="/production/group",c="/user",d="/chartdata";function p(t){return Object(o.a)({url:l+r+"getStats",method:"post",params:t})}function f(t,e){return Object(o.a)({url:l+n,method:"post",data:e})}function g(t){return Object(o.a)({url:l+i,method:"post",data:t})}function m(t){return Object(o.a)({url:l+u,method:"post",data:t})}function h(t){return Object(o.a)({url:l+s,method:"post",data:t})}function b(t){return Object(o.a)({url:l+c,method:"post",data:t})}function D(t){return Object(o.a)({url:l+d,method:"post",data:t})}},wgqH:function(t,e,a){}}]);