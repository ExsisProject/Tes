(function(){define(["jquery","collections/paginated_collection","approval/models/doclist_item"],function(e,t,n){var r=null,i=t.extend({type:"all",deptId:null,model:n.extend({idAttribute:"_id"}),initialize:function(e,n){t.prototype.initialize.apply(this,arguments),this.type=e,this.deptId=n},url:function(){return"/api/"+this.getBaseURL()+"/"+this.type+"?"+this._makeParam()},getCsvURL:function(){return"/api/"+this.getBaseURL()+"/all/csv?"+this._makeParam()},fetch:function(n){typeof n!="undefined"||(n={});var i=this,s=n.beforeSend;_.isFunction(s)||(r=e.goPreloader(),r.render());var o=n.complete;return n.complete=function(e){r!=null&&r.release(),_.isFunction(o)&&o(i,e)},t.prototype.fetch.call(this,n)},_makeParam:function(){return e.param({page:this.pageNo,offset:this.pageSize,property:this.property,direction:this.direction,searchtype:this.searchtype,keyword:this.keyword})},getBaseURL:function(){return _.isEmpty(this.deptId)?"approval/doclist/reception":"approval/deptfolder/receive/"+this.deptId},setType:function(e){this.type=e},setSort:function(e,t){this.property=e,this.direction=t,this.pageNo=0},setSearch:function(e,t){this.searchtype=e,this.keyword=t,this.pageNo=0},setListParam:function(){this.pageNo=sessionStorage.getItem("list-history-pageNo"),this.pageSize=sessionStorage.getItem("list-history-pageSize"),this.property=sessionStorage.getItem("list-history-property"),this.direction=sessionStorage.getItem("list-history-direction"),this.searchtype=sessionStorage.getItem("list-history-searchtype"),this.keyword=sessionStorage.getItem("list-history-keyword").replace(/\+/gi," ")},getCompletedDocumentCount:function(){var e=0;return _.each(this.models,function(t){t.isCompleted()&&(e+=1)}),e}});return i})}).call(this);