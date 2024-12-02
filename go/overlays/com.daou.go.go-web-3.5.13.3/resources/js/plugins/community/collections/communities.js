define([
    "backbone",
    "community/models/communities" 
],

function(
		Backbone, 
		Model
) {	
	var Communities = Backbone.Collection.extend({
		model : Model,
		url: function() {
			return "/api/community/list/menu";
		}
	}); 
	
	return {
		getCollection: function() {
			var CommunitiesCollection = new Communities();
			CommunitiesCollection.fetch({ async : false });
			return CommunitiesCollection;
		},
		create : function(opts){
		    return new Communities(opts);
		}
	};	
});