(function() {
	define([
	    "backbone"
	],
	function(Backbone) {
		var instance = null;
		var model = Backbone.Model.extend({
			url: function() {
				return ["/api/community", this.get("communityId"), 'board'].join('/');
			}					
		});		
		return model;
	});
}).call(this);