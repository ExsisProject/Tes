define([
    "backbone"
],

function(Backbone) {
	var DeleteContact = Backbone.Model.extend({
		url: function() {
			return "/api/contact/contacts";
		}
	});
	return DeleteContact;
});