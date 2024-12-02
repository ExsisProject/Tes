define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return '/ad/api/asset/list';
		}
	}); 
	
	return {
		getCollection: function() {
			var assetList = new AssetList();
			assetList.fetch({async:false});
			return assetList;
		}
	};
});