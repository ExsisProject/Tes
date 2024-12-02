define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var FavoriteFormModel = Backbone.Model.extend({
		url: function() {
			var url = '/api/approval/favorite';
			//if(this.get('favoriteId')) url = ['/api/approval/favorite', this.get('favoriteId')].join('/');
			return url;
		}
	}, {
		get: function() {
			if(instance == null) instance = new FavoriteFormModel();
			instance.fetch({async:false});
			return instance;
		},
		setUrl: function(id) {
			alert(this.url)
			this.url = '/api/approval/favorite/' + id;
			alert(this.url)
		}
	}); 
	
	return FavoriteFormModel;
});