define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var MailServer = Backbone.Collection.extend({
		url: function() {
			return "/ad/api/system/servers";
		},
	}, {
		get: function() {
			if(instance == null) instance = new MailServer();
			instance.set({silent:true});
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return {
		read : function(){
			return webRevision = MailServer.get();
		}
	};
});