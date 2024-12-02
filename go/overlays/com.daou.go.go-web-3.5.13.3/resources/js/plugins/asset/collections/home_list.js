define([
    "backbone"
],

function(
		Backbone 
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return '/api/asset/'+this.urlPart;
		},
		setUrlPart : function(type){
			if(type == 'assetList'){
				this.urlPart = 'list';
			}else{
				this.urlPart = 'my/reservation/remnant';
			}
		}
	}); 
	
	return {
		getCollection: function(type) {
			var assetList = new AssetList();
			assetList.setUrlPart(type);
			assetList.reset();
			assetList.fetch({async:true,reset:true});
			return assetList;
		}
	};
});