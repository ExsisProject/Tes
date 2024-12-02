(function() {
	define([
        "backbone",
        "board/models/post" 
    ],

    function(
    		Backbone, 
    		Model
    ) {	
    	var BoardClassicPosts = Backbone.Collection.extend({
    		model : Model,
    		url: function() {
    			var url = "/api/board/"+ this.boardId+ '/posts/classic';
    			if(this.notice) url += '/notice';
    			return url;
    		},
    		
    		hasNewFlagPost : function() {
    			var newFlagPosts = this.select(function(model) {
    				return model.get("newFlag");
    			});
    			
    			return newFlagPosts.length > 0;
    		}
    	});
    	
    	return BoardClassicPosts;
    });
}).call(this);
