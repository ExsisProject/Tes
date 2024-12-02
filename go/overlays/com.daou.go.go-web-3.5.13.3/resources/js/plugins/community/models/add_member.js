define([
    "backbone"
],

function(Backbone) {
	var CommunityAddMember = Backbone.Model.extend({
		url: function() {
			return [ "/api/community", this.get('communityId'), "members/online"].join('/');
		},
	});
	return CommunityAddMember;
});