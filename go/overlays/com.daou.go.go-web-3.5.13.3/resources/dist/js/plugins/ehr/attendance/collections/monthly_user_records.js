define(["backbone","collections/paginated_collection","attendance/models/monthly_user_record"],function(e,t,n){var r=t.extend({logMonth:"",model:function(e,t){return new n(e,logMonth)},initialize:function(e){t.prototype.initialize.apply(this,arguments),logMonth=e.month,this.deptId=e.deptId},url:function(){return GO.contextRoot+"api/ehr/attnd/record/month/"+logMonth+"?"+this.getUrlParam()},getMonth:function(){return logMonth},setMonth:function(e){logMonth=e},getUrlParam:function(){return $.param(this.getParam())},getParam:function(){return{page:this.pageNo,offset:this.pageSize,property:this.property,direction:this.direction,searchtype:this.searchtype,keyword:this.keyword,deptid:this.deptId}},setSort:function(e,t){this.property=e,this.direction=t,this.pageNo=0},setDept:function(e){this.deptId=e},setSearch:function(e,t){this.searchtype=e,this.keyword=t,this.pageNo=0}});return r});