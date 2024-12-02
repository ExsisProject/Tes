define([
    "backbone",
    "report/models/report_search"
],

function(
		Backbone, 
		Model
) {	
	var instance = null;
	var ReportSearch = Backbone.Collection.extend({
		model : Model,
		conditions: {
            type: 'all', 
            page: 1, 
            offset: 20
        },
		url: GO.contextRoot + "api/search/report",
		initialize: function() {
            this.conditions = {
                type: 'all', 
                page: 1, 
                offset: 20
            };
        },
        setConditions : function() {
        	this.conditions = GO.util.getSearchParam(window.MsearchParam);
        },
		conditionValidate: function() {
			if(!this.conditions.stype) throw new Error("'stype' 파라미터는 필수입니다.");
            if(this.conditions.stype === 'simple' && !this.conditions.keyword) throw new Error("'simple'타입 검색에는 'keyword' 속성이 필요합니다.");
            if(!this.conditions.searchType) throw new Error("'searchType' 파라미터는 필수입니다.");
            return true;
        }
        
	}, {
		setFetch: function(opt) {
			var instance = new ReportSearch();
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
		searchCollection: function(opt) {
			var searchCollection = ReportSearch.setFetch(opt);
			return searchCollection;
		}
	};
});