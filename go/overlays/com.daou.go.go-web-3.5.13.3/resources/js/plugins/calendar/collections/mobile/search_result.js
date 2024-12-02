define([
    "backbone"
],

function(
		Backbone 
) {	
	var SearchResults = GO.BaseCollection.extend({
		conditions: {
            type: 'all', 
            page: 1, 
            offset: 20
        },
		url: function() {
			return "/api/search/calendar";
		},
		initialize: function() {
          /*  this.conditions = {
                type: 'all', 
                page: 1, 
                offset: 20
            };*/
        },
        setConditions : function() {
        	//this.conditions = GO.router.getSearch();
        },
		
		conditionValidate: function() {
			if(!this.conditions.stype) throw new Error("'stype' 파라미터는 필수입니다.");
            if(this.conditions.stype === 'simple' && !this.conditions.keyword) throw new Error("'simple'타입 검색에는 'keyword' 속성이 필요합니다.");
            if(!this.conditions.searchType) throw new Error("'searchType' 파라미터는 필수입니다.");
            if(!this.conditions.isCommunity) throw new Error("'isCommunity' 파라미터는 필수입니다.");
            return true;
        }
	});
	
	return {
		getCollection: function(opt) {
			var searchResults = new SearchResults();
			searchResults.setConditions();
			searchResults.fetch({
								data:opt,
								async:true ,
								type: 'GET',
								contentType:'application/json',
								reset: true
								});
			return searchResults;
		},
		setCollection : function(){
			return SearchResults;
		}
	};
});