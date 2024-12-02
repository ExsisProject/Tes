define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var PostRecommend = Backbone.Model.extend({
		url: function() {
			this.boardId = this.get('boardId');
			this.postId = this.get('postId');
			return ["/api/board", this.boardId ,"post",this.postId,'recommend'].join('/');
		}
	}, {
		get : function(options) {
			instance = new PostRecommend(options);
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return PostRecommend;
});