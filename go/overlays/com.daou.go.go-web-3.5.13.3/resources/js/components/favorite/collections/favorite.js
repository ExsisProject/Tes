define([
    "backbone"
],

function(
		Backbone, 
		Model
) {	
	var FavoriteCollection = Backbone.Collection.extend({
		url: function() {
			return this.url;
		},		
		setUrl : function(options) {
			this.url = options.url;
		},
		hasFavorite : function() {
			return this.length > 0;
		}
	}); 
	
	return {
		get: function(options) {
			var instance = new FavoriteCollection();
			instance.setUrl(options);
			instance.fetch({data : { offset : 1000 }, async : false, reset: true});
			return instance;
		},
		create : function(options){
			var instance = new FavoriteCollection();
			instance.setUrl(options);
			return instance;
		}
	};
});