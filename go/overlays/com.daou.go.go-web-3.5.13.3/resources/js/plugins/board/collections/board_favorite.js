define([
    "backbone",
    "board/models/board_favorite" 
],
function(
		Backbone, 
		Model
) {	
	var instance = null;
	var FavoriteCollection = Backbone.Collection.extend({
		model : Model,
		url: function() {
			return "/api/board/favorite";
		}
	});
	
	return {
		getCollection: function() {
			if(instance == null) instance =  new FavoriteCollection();
			instance.fetch({data : { 'page' : '0' , 'offset' : '1000' } ,async:false});
			return instance;
		},
		create : function(opts){
		    return new FavoriteCollection(opts);
		}
	};
});