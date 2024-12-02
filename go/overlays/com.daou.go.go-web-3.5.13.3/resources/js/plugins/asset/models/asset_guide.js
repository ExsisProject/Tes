(function() {
	define([
	    "backbone"
	],
	
	function(Backbone) {
		var assetGuideModel = Backbone.Model.extend({
			url: function() {
				this.assetId = this.get('assetId');
				var url = ["/api/asset", this.assetId ,"guide"];
				return url.join('/');
			}
		}); 
		return assetGuideModel;
	});
}).call(this);