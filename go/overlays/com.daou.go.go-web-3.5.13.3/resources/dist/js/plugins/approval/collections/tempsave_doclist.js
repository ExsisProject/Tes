(function(){define(["jquery","collections/paginated_collection","approval/models/doclist_item"],function(e,t,n){var r=null,i=t.extend({model:n,url:function(){return"/api/approval/doclist/tempsave/"+this.type+"?"+this._makeParam()},getCsvURL:function(){return"/api/approval/doclist/tempsave/all/csv?"+this._makeParam()},_makeParam:function(){return e.param({page:this.pageNo,offset:this.pageSize,property:this.property,direction:this.direction,searchtype:this.searchtype,keyword:this.keyword})},fetch:function(n){typeof n!="undefined"||(n={});var i=this,s=n.beforeSend;_.isFunction(s)||(r=e.goPreloader(),r.render());var o=n.complete;return n.complete=function(e){r!=null&&r.release(),_.isFunction(o)&&o(i,e)},t.prototype.fetch.call(this,n)},setType:function(e){_.contains(e,"?")?this.type=e.substr(0,_.indexOf(e,"?")):this.type=e},setSort:function(e,t){this.property=e,this.direction=t,this.pageNo=0},setSearch:function(e,t){this.searchtype=e,this.keyword=t,this.pageNo=0},setListParam:function(){this.pageNo=sessionStorage.getItem("list-history-pageNo"),this.pageSize=sessionStorage.getItem("list-history-pageSize"),this.property=sessionStorage.getItem("list-history-property"),this.direction=sessionStorage.getItem("list-history-direction"),this.searchtype=sessionStorage.getItem("list-history-searchtype"),this.keyword=sessionStorage.getItem("list-history-keyword").replace(/\+/gi," ")}});return i})}).call(this);