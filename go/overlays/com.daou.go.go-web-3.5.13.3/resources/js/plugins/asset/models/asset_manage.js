(function() {
	define([
	    "backbone"
	],
	
	function(Backbone) {
		var assetManageModel = Backbone.Model.extend({
			url: function() {
				this.assetId = this.get('assetId');
				var url = ["/api/asset", this.assetId ,"managable"];
				return url.join('/');
			}
		}); 
		return assetManageModel;
	});
}).call(this);