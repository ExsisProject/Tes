define([
    "backbone"
],

function(Backbone) {
	
	var CustomProfileConfig = Backbone.Model.extend({
	    urlRoot: GO.contextRoot+"ad/api/customprofile/config"
	}, {
	    create : function() {
	        return new CustomProfileConfig();
	    }
	}); 
	
	return {
		create : function(){
		    return CustomProfileConfig.create();
		}
	};
});