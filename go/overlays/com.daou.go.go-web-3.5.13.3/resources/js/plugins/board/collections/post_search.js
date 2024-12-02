define([
    "backbone",
    "board/models/post"
],

function(
		Backbone, 
		Model
) {	
	var instance = null;
	var BoardSearch = Backbone.Collection.extend({
		model : Model,
		conditions: {
            type: 'all', 
            page: 1, 
            offset: 20
        },
		url: function() {
			return this.url;
		},
		initialize: function() {
            this.conditions = {
                type: 'all', 
                page: 1, 
                offset: 20
            };
        },
        setConditions : function() {
        	//this.conditions = GO.router.getSearch();
        	this.conditions = GO.util.getSearchParam(window.MsearchParam);
        },
		setUrl : function(isCommunity){
			//this.conditionValidate();
			if(isCommunity == true || isCommunity == 'true'){
				this.url = "/api/search/community";
			}else{
				this.url = "/api/search/board";
			}
			
		},
		conditionValidate: function() {
			if(!this.conditions.stype) throw new Error("'stype' 파라미터는 필수입니다.");
            if(this.conditions.stype === 'simple' && !this.conditions.keyword) throw new Error("'simple'타입 검색에는 'keyword' 속성이 필요합니다.");
            if(!this.conditions.searchType) throw new Error("'searchType' 파라미터는 필수입니다.");
            if(!this.conditions.isCommunity) throw new Error("'isCommunity' 파라미터는 필수입니다.");
            return true;
        }
        
	}, {
		setFetch: function(opt,isCommunity) {
			instance = new BoardSearch();
			var data = [];
			instance.setUrl(isCommunity);
			instance.fetch({	
					data: opt,
					async:false ,
					type: 'GET',
					contentType:'application/json'
			});
			return instance;
		}
	});
	
	return {
		searchCollection: function(opt,isCommunity) {
			var searchCollection = BoardSearch.setFetch(opt,isCommunity);
			return searchCollection;
		},
		setCollection : function(isCommunity) {
			var instance = new BoardSearch();
			instance.setUrl(isCommunity);
			return instance;
		}
	};
});