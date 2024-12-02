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
    			var url = "/api/board/"+ this.boardId+ '/posts/'+this.postId+'/classic/tiny';
    			if(this.notice) url += '/notice';
    			return url;
    		}
    	});
    	
    	return BoardClassicPosts;
    });
}).call(this);
