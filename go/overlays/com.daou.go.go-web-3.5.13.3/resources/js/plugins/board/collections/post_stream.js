define([
    "backbone",
    "board/models/post" 
],

function(
		Backbone, 
		Model
) {	
	var BoardStreamPosts = Backbone.Collection.extend({
		model : Model,
		
		initialize: function(datas, options) {
			this.boardId = options.boardId;
		},
		
		url: function() {
			return ["/api/board", this.boardId, 'posts/stream'].join('/');
		}
	});
	
	return BoardStreamPosts;
});