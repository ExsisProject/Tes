define([
    "backbone"
],

function(
		Backbone
) {	
    var instance = null;
	var PositionCollection = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return GO.contextRoot + "ad/api/position/list";
		}
	}); 
	
	return {
		getCollection: function() {
		    if(instance == null) instance = new PositionCollection();
		    instance.fetch({ 
				async : false,
				contentType : 'application/json'
				});
			return instance;
		}		
	};	
});