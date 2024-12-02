define([
    "backbone"
],
function(Backbone) {
	var ContactInfo = Backbone.Model.extend({
		url: function() {
			return "/api/contact/company/group/"+this.get('groupId')+'/contact/'+this.get('contactId');
		},
	});
	return ContactInfo;
});