define([
    "backbone"
],

function(
		Backbone
) {	
	var EtcConfig = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return "/ad/api/etcconfig";
		}
	}); 
	
	return {
		getCollection: function() {
			var etcConfig = new EtcConfig();
			etcConfig.fetch({ async : false });
			return etcConfig;
		}		
	};	
});