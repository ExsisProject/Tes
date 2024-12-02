define([
    "backbone",
],

function(Backbone) {
	var CreateContact = Backbone.Model.extend({
		url: function() {
			return "/api/contact/personal/contact";
		},
	});
	
	return CreateContact;
});