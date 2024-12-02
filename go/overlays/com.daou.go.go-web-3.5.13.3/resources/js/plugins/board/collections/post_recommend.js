define([
    "backbone",
    "board/models/post_recommend" 
],

function(
		Backbone, 
		Model
) {	
	var PostRecommend = Backbone.Collection.extend({
		model : Model,
		url: function() {
			return ["/api/board", this.boardId ,"post",this.postId,'recommend'].join('/');
		},
		
		
		setIds : function(options) {
			this.boardId = options.boardId;
			this.postId = options.postId;
		},
		
		
		isPrev : function() {
			var current = parseInt(this.page.page) + 1;
			
			return current == 1 ? false : true;
		},
		
		
		isNext : function() {
			var lastPage = this.page.lastPage;
			
			return lastPage ? false : true;
		},
		
		
		prePage : function() {
			return parseInt(this.page.page) - 1;
		},
		
		
		nextPage : function() {
			return parseInt(this.page.page) + 1;
		}
	}); 
	
	return {
		getCollection: function(options) {
			var postRecommend = new PostRecommend();
			postRecommend.setIds(options);
			postRecommend.fetch({
				data : options.data,
				async : false 
			});
			return postRecommend;
		}		
	};
});