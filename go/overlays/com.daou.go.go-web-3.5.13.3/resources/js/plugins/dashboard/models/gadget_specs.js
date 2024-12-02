(function() {
	
	define(["backbone"], function(Backbone) {
		
		var GadgetSpec = Backbone.Model.extend({});
		
		var GadgetSpecs = Backbone.Collection.extend({
			model: GadgetSpec,
			url: '/api/dashboard/gadgetspec'
		}); 
		
		return GadgetSpecs;
	});
	
})()