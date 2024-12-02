define([
    "backbone" 
],

function(
		Backbone
) {	
	var PositionList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return GO.contextRoot+"ad/api/usergroup/list";
		}
	}); 
	
	return {
		getCollection: function() {
			var positionListCollection = new PositionList();
			positionListCollection.fetch({ 
				async : false,
				contentType : 'application/json'
				});
			return positionListCollection;
		}		
	};	
});