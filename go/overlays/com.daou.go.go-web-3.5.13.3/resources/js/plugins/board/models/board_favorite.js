define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var BoardFavorite = Backbone.Model.extend({
		url: function() {
			var url = '/api/board/favorite';
			if(this.get('boardId')) url = ['/api/board', this.get('boardId'), 'favorite'].join('/');
			return url;
		}
	}, {
		get: function() {
			if(instance == null) instance = new BoardFavorite();
			instance.fetch({data : { 'page' : '0' , 'offset' : '1000' } ,async:false});
			return instance;
		}
	}); 
	
	return BoardFavorite;
});