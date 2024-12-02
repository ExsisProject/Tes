define([
    "backbone"
],

function(Backbone) {
	var CommunityMemberOnline = Backbone.Model.extend({
		url: function() {
			return [ "/api/community", this.get('id'), "members/online"].join('/');
		},
	});
	return CommunityMemberOnline;
});