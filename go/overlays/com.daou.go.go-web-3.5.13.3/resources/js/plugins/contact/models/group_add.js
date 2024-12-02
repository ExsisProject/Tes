define([
    "backbone"
],

function(Backbone) {
	var ModifyGroup = Backbone.Model.extend({
		url: function() {
			return "/api/contact/contacts/groups";
		},
	});
	return ModifyGroup;
});