(function() {
	define([
        "backbone",
        "community/models/boards" 
    ],

    function(
    		Backbone, 
    		Model
    ) {	
    	var CommunityBoardHome = Backbone.Collection.extend({
    		model : Model,
    		url: function() {
    			return '/api/community/'+this.communityId+'/board/myhome';
    		}
    	}); 
    	
    	return CommunityBoardHome;
    });
}).call(this);