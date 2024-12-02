define([
    "backbone"
],

function(Backbone) {

	var instance = null;
	var ContactConfig = Backbone.Model.extend({
		url: function() {
			return "/api/contactconfig";
		}}, {
			get: function() {
				if(instance == null) instance = new ContactConfig();
				instance.fetch({async:false});
				return instance;
			}
		}
	);

	return {
		read : function(opt){
			return ContactConfigdModel = ContactConfig.get();
		}
	}
});