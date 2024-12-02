define([
    "backbone"
],

function(Backbone) {
	
	var TMWConfig = Backbone.Model.extend({
	    urlRoot: GO.contextRoot+"ad/api/tmw/config"
	}, {
		get : function() {
			var instance = new TMWConfig();
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return {
		get : function(){
		    return TMWConfig.get();
		}
	};
});