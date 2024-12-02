define([
    "backbone"
],

function(Backbone) {
	
	var AttndConfig = Backbone.Model.extend({
	    urlRoot: GO.contextRoot+"ad/api/attnd/sync/config"
	}, {
		get : function() {
			var instance = new AttndConfig();
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return {
		get : function(){
		    return AttndConfig.get();
		}
	};
});