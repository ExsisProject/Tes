define([
    "backbone"
],

function(
		Backbone 
) {	
	var SearchResults = GO.BaseCollection.extend({
		url: function() {
			return "/api/asset/"+this.assetId+"/item";
		},
		
        setAssetId : function(assetId) {
        	this.assetId = assetId;
        }
	});
	
	return {
		getCollection: function(opt) {
			var searchResults = new SearchResults();
			searchResults.setAssetId(opt.assetId);
			searchResults.fetch({
								data:opt,
								async:true ,
								type: 'GET',
								contentType:'application/json',
								reset: true
								});
			return searchResults;
		}		
	};
});