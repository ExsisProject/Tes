(function(){define(["jquery","collections/paginated_collection","approval/models/doclist_item"],function(e,t,n){var r=null,i=t.extend({model:n,types:["deptdraft","deptreference","deptfolder"],initialize:function(e){t.prototype.initialize.apply(this,arguments),this.folderId=e.folderId,this.deptId=e.deptId,this.type=e.type,this.status=e.status},url:function(){return this._makeURL(!1)},getCsvURL:function(){return this._makeURL(!0)},fetch:function(n){typeof n!="undefined"||(n={});var i=this,s=n.beforeSend;_.isFunction(s)||(r=e.goPreloader(),r.render());var o=n.complete;return n.complete=function(e){r!=null&&r.release(),_.isFunction(o)&&o(i,e)},t.prototype.fetch.call(this,n)},_makeURL:function(e){var t="";return this.type=="deptdraft"?t="/api/approval/deptfolder/draft/"+this.deptId:this.type=="deptreference"?(t="/api/approval/deptfolder/reference/"+this.deptId,this.status!=undefined&&(t+="/"+this.status)):this.type=="deptofficial"?t="/api/approval/deptfolder/official/"+this.deptId:t="/api/approval/deptfolder/"+this.folderId+"/documents",t+(e?"/csv":"")+"?"+this._makeParam()},_makeParam:function(){var t={page:this.pageNo,offset:this.pageSize,property:this.property,direction:this.direction,searchtype:this.searchtype,keyword:this.keyword};return this.usePeriod&&(t.fromDate=this.fromDate,t.toDate=this.toDate,t.duration=this.duration),e.param(t)},setFolderId:function(e){this.folderId=e},setDeptId:function(e){this.deptId=e},setType:function(e){this.type=e},setSort:function(e,t){this.property=e,this.direction=t,this.pageNo=0,this.pageSize=20},setDuration:function(e){e=e||{},this.duration=e.duration||"all",this.fromDate=e.fromDate||"",this.toDate=e.toDate||""},setSearch:function(e,t){this.searchtype=e,this.keyword=t,this.pageNo=0,this.pageSize=20},setListParam:function(){this.pageNo=sessionStorage.getItem("list-history-pageNo"),this.pageSize=sessionStorage.getItem("list-history-pageSize"),this.property=sessionStorage.getItem("list-history-property"),this.direction=sessionStorage.getItem("list-history-direction"),this.searchtype=sessionStorage.getItem("list-history-searchtype"),this.keyword=sessionStorage.getItem("list-history-keyword").replace(/\+/gi," "),this.usePeriod&&(this.duration=sessionStorage.getItem("list-history-duration"),this.fromDate=sessionStorage.getItem("list-history-fromDate"),this.toDate=sessionStorage.getItem("list-history-toDate"))}});return i})}).call(this);