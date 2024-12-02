define(
    [
        "backbone"
    ],

    function(
            Backbone
    ) { 
        
        var SearchResults = Backbone.Collection.extend({
            model : Backbone.Model,
            
            
            initialize : function(options) {
                this.listOption.page = 0;
            	this.param = options.param;
            },
            
            
            url : function() {
            	var param = _.extend(this.param, this.listOption);
            	
            	return GO.contextRoot + "api/search/task?" + $.param(param);
            },
            
            
            listOption : {
            	page : "0",
            	offset : 20
            },
            
            
            setPage : function(page) {
            	this.listOption.page = page;
            },
            
            
            getPageInfo : function() {
            	var page = this.listOption.page;
            	var total = this.page.total;
            	var offset = this.listOption.offset;
            	
            	var isFirstPage = page == 0;
            	var isLastPage = this.page.lastPage;
            	
            	var firstIndex = (page * offset) + 1;
            	var lastIndex = isLastPage ? total : (page + 1) * offset;
            	
            	return {
            		lastIndex : lastIndex,
            		firstIndex : firstIndex,
            		isPossiblePrev : !isFirstPage,
            		isPossibleNext : !isLastPage,
            		total : total
            	};
            }
        });
    
        return SearchResults;
    }
);