(function() {
	define([
        "backbone"
    ],

    function(
    		Backbone
    ) {	
    	var PostReader = Backbone.Collection.extend({
    		url: function() {
    			return ["/api/board", this.boardId ,"post",this.postId,'reader'].join('/');
    		}, 
    		setIds : function(options) {
    			this.boardId = options.boardId;
    			this.postId = options.postId;
    		}
    	}); 
    	
    	return {
    		getCollection: function(options) {
    			var postReader = new PostReader();
    			postReader.setIds(options);
    			postReader.fetch({ async : false });
    			return postReader;
    		}		
    	};
    });
}).call(this);