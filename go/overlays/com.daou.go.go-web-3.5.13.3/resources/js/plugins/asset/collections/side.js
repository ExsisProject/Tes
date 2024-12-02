define([
    "backbone" 
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return '/api/asset';
		},
		setUrl : function(url){
			this.url = url;
		}
	});
	

	
	var AssetShareList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return '/api/asset/share';
		}
	});
	
	var AssetShareItemModel = Backbone.Model.extend({
		defaults : {
			isCompanyShared : true
		}
	});
	
	var AssetShareItemList = Backbone.Collection.extend({
		model : AssetShareItemModel
	});
	
	return {
		getCollection: function() {
			var assetList = new AssetList();
			assetList.fetch({reset: true});
			return assetList;
		},
		getShareCollection: function() {
			var assetList = new AssetShareList();
			assetList.fetch({async: false});
			return assetList;
		},
		createCollectionByList : function(list){
			var assetList = new AssetShareItemList(list);
			return assetList;			
		},
		getAsset: function() {
			var assetList = new AssetList();
			assetList.fetch({async : false});
			return assetList;
		}
	};
});