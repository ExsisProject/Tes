define([
    "backbone"
],

function(Backbone) {
	var CommunityMemberRemove = Backbone.Model.extend({
		url: function() {			
			return [ "/api/community", this.get("id"), "members/remove"].join('/');
		}
	});
	return CommunityMemberRemove;
});