define([
    "backbone"
],

function(Backbone) {
	var model = Backbone.Model.extend({
		url: function() {
			this.assetId = this.get('assetId');	
			this.urlPart = this.get('urlPart');
			return ['/api/asset',this.assetId,this.urlPart].join('/');
		}
	}); 
	return model;
});