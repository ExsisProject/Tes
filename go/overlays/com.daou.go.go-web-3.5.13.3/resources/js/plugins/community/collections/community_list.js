(function() {
	define([
        "backbone",
        "community/models/communities" 
    ],

    function(
    		Backbone, 
    		Model
    ) {	
    	var communityList = Backbone.Collection.extend({
    		model : Model,
    		url: function() {
    			var url = "/api/community/list";
    			if(this.type) url += '/'+this.type;
    			return url;
    		}
    	});
    	
    	return communityList;
    });
}).call(this);
