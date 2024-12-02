define(
    [
        "backbone",
        "docs/models/docs_doc_item",
        "collections/paginated_collection"
    ],

    function(
            Backbone,
            DocsListItemModel,
            PaginatedCollection
    ) { 
        
        var DocsListItem = PaginatedCollection.extend({
            model : DocsListItemModel,
            
            url: function() {
            	var url = GO.contextRoot + "api/docs/folder/";

            	if (this.folderType == "latestread") {
	    			url += "latestread";
	    		} else if(this.folderType == "latestupdate"){
	    			url += "latestupdate";
				}else if(this.folderType == "registwaiting"){
					url += "registwaiting";
				}else if(this.folderType == "approvewaiting"){
					url += "approvewaiting";
				} else{
					url += this.folderId + "/docses";
				}

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
    
        return DocsListItem;
    }
);