(function(){define(["jquery","collections/paginated_collection","docs/models/docs_doc_item","jquery.go-preloader"],function(e,t,n){var r=null,i=t.extend({model:n,initialize:function(e){t.prototype.initialize.apply(this,arguments)},_makeParam:function(){var t={page:this.pageNo,offset:this.pageSize,property:this.property,direction:this.direction,searchtype:this.searchtype,keyword:this.keyword};return this.usePeriod&&(t.fromDate=this.fromDate,t.toDate=this.toDate,t.duration=this.duration),e.param(t)},setDuration:function(e){e=e||{},this.duration=e.duration||"all",this.fromDate=e.fromDate||"",this.toDate=e.toDate||""},fetch:function(n){typeof n!="undefined"||(n={});var i=this,s=n.beforeSend;_.isFunction(s)||(r=e.goPreloader(),r.render());var o=n.complete;return n.complete=function(e){r!=null&&r.release(),_.isFunction(o)&&o(i,e)},t.prototype.fetch.call(this,n)},setSort:function(e,t){this.property=e,this.direction=t,this.pageNo=0},setSearch:function(e,t){this.searchtype=e,this.keyword=t,this.pageNo=0},setListParam:function(){this.pageNo=sessionStorage.getItem("list-history-pageNo"),this.pageSize=sessionStorage.getItem("list-history-pageSize"),this.property=sessionStorage.getItem("list-history-property"),this.direction=sessionStorage.getItem("list-history-direction"),this.searchtype=sessionStorage.getItem("list-history-searchtype"),this.keyword=sessionStorage.getItem("list-history-keyword").replace(/\+/gi," "),this.usePeriod&&(this.duration=sessionStorage.getItem("list-history-duration"),this.fromDate=sessionStorage.getItem("list-history-fromDate"),this.toDate=sessionStorage.getItem("list-history-toDate"))}});return i})}).call(this);