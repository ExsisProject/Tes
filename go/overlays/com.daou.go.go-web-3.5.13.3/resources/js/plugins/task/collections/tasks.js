define(
    [
        "backbone",
        "task/models/task",
        "collections/paginated_collection"
    ],

    function(
            Backbone,
            TaskModel,
            PaginatedCollection
    ) { 
        
        var Tasks = PaginatedCollection.extend({
            model : TaskModel,
            
            url: function() {
            	var url = GO.contextRoot + "api/task/folder/" + this.folderId + "/task";
            	
            	if (this.searchType) {
	    			url += "/search";
	    		} 
	    			
    			url += "?" + this.makeParam();
    			
    			return url;
            },
            
            
            isEmpty : function() {
            	return this.models.length == 0;
            },
            
            
            mobilePageInfo : function() {
            	var pageInfo = this.pageInfo();
            	var page = pageInfo.pageNo;
            	var total = pageInfo.total;
            	var offset = pageInfo.pageSize;
            	var isLastPage = pageInfo.pageNo == pageInfo.lastPageNo;
            	var firstIndex = (page * offset) + 1;
            	var lastIndex = isLastPage ? total : (page + 1) * offset;
            	
            	return {
            		lastIndex : lastIndex,
            		firstIndex : firstIndex
            	};
            }
        });
    
        return Tasks;
    }
);