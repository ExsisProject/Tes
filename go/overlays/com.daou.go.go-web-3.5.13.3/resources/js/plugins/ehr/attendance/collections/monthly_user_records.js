define([
    "backbone",
    "collections/paginated_collection",
    "attendance/models/monthly_user_record"
],

function(
    Backbone,
    PaginatedCollection,
    MonthlyUserRecord
) {
    var MonthlyUserRecords = PaginatedCollection.extend({
        logMonth : "",
        model : function(attrs, options){
            return new MonthlyUserRecord(attrs, logMonth);
        },
        initialize : function(options){
            PaginatedCollection.prototype.initialize.apply(this, arguments);
            logMonth = options.month; // ??
            this.deptId = options.deptId;
        },
        url : function(){
            return GO.contextRoot + "api/ehr/attnd/record/month/" + logMonth + '?' + this.getUrlParam();
        },
        
        getMonth : function(){
            return logMonth;
        },
        
        setMonth : function(month){
            logMonth = month;
        },
        
        getUrlParam : function(){
        	return $.param(this.getParam());
        },
        
        getParam : function(){
        	return {
                page: this.pageNo, 
                offset: this.pageSize,
                property: this.property, 
                direction: this.direction, 
                searchtype : this.searchtype, 
                keyword : this.keyword,
                deptid : this.deptId
            }
        },
        
        setSort: function(property,direction) {
            this.property = property;
            this.direction = direction;
            this.pageNo = 0;
        },
        
        setDept : function(deptId){
            this.deptId = deptId;
        },
        
        setSearch: function(searchtype,keyword) {
            this.searchtype = searchtype;
            this.keyword = keyword;
            this.pageNo = 0;
        }
    });
    return MonthlyUserRecords;
});