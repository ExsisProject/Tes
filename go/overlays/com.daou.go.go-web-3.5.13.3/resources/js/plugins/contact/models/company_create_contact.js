define([
    "backbone"
],

function(Backbone) {
	var CreateContact = Backbone.Model.extend({
		url: function() {
			return '/api/contact/company/group/'+this.groupId +'/contact';
		},
		
		setGroupId : function(groupId){
			this.groupId = groupId;
		}
		
	});
	return CreateContact;
});