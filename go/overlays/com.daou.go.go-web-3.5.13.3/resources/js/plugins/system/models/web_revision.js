define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var WebRevision = Backbone.Model.extend({
		url: function() {
			return "/ad/api/webrevision";
		},
	}, {
		get: function() {
			if(instance == null) instance = new WebRevision();
			instance.set({silent:true});
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return {
		read : function(){
			return webRevision = WebRevision.get();
		}
	};
});