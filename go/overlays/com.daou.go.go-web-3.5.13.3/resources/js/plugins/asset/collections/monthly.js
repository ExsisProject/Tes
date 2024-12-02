define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return ['/api/asset',this.assetId,'item',this.itemId,'monthly'].join('/');
		},
		setUrlId : function(opt){
			this.assetId = opt.assetId;
			this.itemId = opt.itemId;
		}
	}); 
	
	return {
		getCollection: function(opt) {
			var assetList = new AssetList();
			var data = {
				fromDate : opt.fromDate	
			};
			assetList.setUrlId(opt);
			assetList.fetch({data : data, async:true,reset:true});
			return assetList;
		}
	};
});