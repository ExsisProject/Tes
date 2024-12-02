define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return ['/api/asset',this.assetId,'item',this.itemId].join('/');
		},
		setUrlPart : function(type){
			if(type == 'info'){
				this.urlPart = 'attribute/item';
			}else if(type == 'reservation'){
				this.urlPart = 'attribute/reservation';
			}else if(type == 'item'){
				this.urlPart = 'item';
			}
		},
		setAssetId : function(id){
			this.assetId = id;
		},
		setItemId : function(id){
			this.itemId = id;
		}
	}); 
	
	return {
		getCollection: function(opt) {
			var assetList = new AssetList();
			assetList.setItemId(opt.itemId);
			assetList.setAssetId(opt.assetId);
			assetList.fetch({async:true,reset:true});
			return assetList;
		}
	};
});