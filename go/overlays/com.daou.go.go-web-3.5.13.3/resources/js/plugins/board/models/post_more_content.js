(function() {
	define([
	    "backbone"
	],
	
	function(Backbone) {
		var PostComment = Backbone.Model.extend({
			url: function() {
				this.boardId = this.get('boardId');
				this.postId = this.get('postId');
				return ["/api/board", this.boardId ,"post",this.postId,'content'].join('/');
			}
		}); 
		
		return PostComment;
	});
}).call(this);