(function(){define(["jquery","collections/paginated_collection","approval/models/doclist_item"],function(e,t,n){var r=t.extend({model:n,initialize:function(e){t.prototype.initialize.apply(this,arguments),this.folderId=e.folderId,this.type=e.type,this.deptId=e.deptId,this.belong=e.belong},url:function(){return this._makeURL(!1)},getCsvURL:function(){return this._makeURL(!0)},_makeURL:function(e){var t="/api/approval/userfolder/"+this.folderId+"/share/"+this.belong;return this.type=="userfolder"?this.belong=="indept"?t="/api/approval/userfolder/"+this.folderId+"/share/"+this.belong+"/"+this.deptId:t="/api/approval/userfolder/"+this.folderId+"/share/"+this.belong:this.type=="deptfolder"&&(t="/api/approval/deptfolder/"+this.folderId+"/share/"+this.belong+"/"+this.deptId),t+(e?"/csv":"")+"?"+this._makeParam()},_makeParam:function(){var t={page:this.pageNo,offset:this.pageSize,property:this.property,direction:this.direction,searchtype:this.searchtype,keyword:this.keyword};return this.usePeriod&&(t.fromDate=this.fromDate,t.toDate=this.toDate,t.duration=this.duration),e.param(t)},setFolderId:function(e){this.folderId=e},setDeptId:function(e){this.deptId=e},setType:function(e){this.type=e},setSort:function(e,t){this.property=e,this.direction=t,this.pageNo=0,this.pageSize=20},setDuration:function(e){e=e||{},this.duration=e.duration||"all",this.fromDate=e.fromDate||"",this.toDate=e.toDate||""},setSearch:function(e,t){this.searchtype=e,this.keyword=t,this.pageNo=0,this.pageSize=20},setListParam:function(){this.pageNo=sessionStorage.getItem("list-history-pageNo"),this.pageSize=sessionStorage.getItem("list-history-pageSize"),this.property=sessionStorage.getItem("list-history-property"),this.direction=sessionStorage.getItem("list-history-direction"),this.searchtype=sessionStorage.getItem("list-history-searchtype"),this.keyword=sessionStorage.getItem("list-history-keyword").replace(/\+/gi," "),this.usePeriod&&(this.duration=sessionStorage.getItem("list-history-duration"),this.fromDate=sessionStorage.getItem("list-history-fromDate"),this.toDate=sessionStorage.getItem("list-history-toDate"))}});return r})}).call(this);