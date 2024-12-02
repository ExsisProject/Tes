define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return '/api/asset/'+this.assetId+'/item/'+this.itemId+'/weekly';
		},
		setParam : function(opt){
			this.assetId = opt.assetId;
			this.itemId = opt.itemId;
		}
	}); 
	
	return {
		getCollection: function(opt) {
			var assetList = new AssetList();
			var param= {fromDate : opt.fromDate};
			assetList.setParam(opt);
			assetList.fetch({data : param, async:true, reset:true});
			return assetList;
		}
	};
});