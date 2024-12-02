define([
    "backbone"
],

function(Backbone) {
	var CreateGroup = Backbone.Model.extend({
		url: function() {
			return "/api/contact/import/dept";
		},
	});
	return CreateGroup;
});