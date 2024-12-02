(function() {
	define(function(require) {
		var Backbone = require("backbone");
		var Model = require("contact/models/contact");
		
    	var contacts = Backbone.Collection.extend({
    		model : Model,
    		url: function() {
    			return '/api/contact/personal/group/'+this.groupId +'/contacts';
    		}
    	});
    	
    	return contacts;
    });
}).call(this);
