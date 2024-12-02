define([
    "backbone",
    "approval/models/favoriteform" 
],
function(
		Backbone, 
		Model
) {	
	var instance = null;
	var FavoriteFormCollection = Backbone.Collection.extend({
		model : Model,
		url: function() {
			console.log("return ");
//			return "/api/board/favorite";
			return "/api/approval/favorite";
		}
	});
	
	return {
		getCollection: function() {
			if(instance == null) instance =  new FavoriteFormCollection();
			instance.fetch({data : {} , async:false});
			
			return instance;
		}		
	};
});