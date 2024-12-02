define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return ['/api/asset',this.assetId,'item'].join('/');
		},		
		setAssetId : function(id){
			this.assetId = id;
		}		
	}); 
	
	return {
		getCollection: function(opt) {
			
			var assetList = new AssetList();		
			assetList.setAssetId(opt.assetId);
			
			var data = {};
			data.page = opt.page || '0';
			data.offset = opt.offset || '10';
			data.isVisibleOnly = "false";
			data.direction = "desc";
			
			assetList.fetch({data : data, async:true,reset:true});
			return assetList;
		}
	};
});