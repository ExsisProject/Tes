define([
    "backbone"
],

function(
		Backbone 
) {	
    var instance = null;
	var PositionCollection = Backbone.Collection.extend({
		model : Backbone.Model.extend(),
		url: function() {
			return GO.contextRoot + "api/position/list";
		}
	}); 
	
	return {
		getCollection: function() {
		    if(instance == null) instance = new PositionCollection();
		    instance.fetch({ 
				async : true,
				reset:true,
				contentType : 'application/json'
				});
			return instance;
		}		
	};	
});