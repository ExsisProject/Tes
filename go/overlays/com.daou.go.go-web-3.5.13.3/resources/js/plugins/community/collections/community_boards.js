(function() {
	define([ 
    	"backbone", 
    	"community/models/boards" 
    ],

    function(Backbone, Model) {
    	var CommunityBoardCollection = Backbone.Collection.extend({
    		model : Model,
    		url : function() {
    			return [ "/api/community", this.communityId, "board" , this.status].join('/');
    		}
    	});
    	
    	return CommunityBoardCollection;
    });
}).call(this);