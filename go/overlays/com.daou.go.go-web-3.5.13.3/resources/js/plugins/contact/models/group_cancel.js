define([
    "backbone"
],

function(Backbone) {
	var GroupCancel = Backbone.Model.extend({
		url: function() {
			return "/api/contact/contacts/group/"+this.get("groupId");
		},
	});
	return GroupCancel;
});