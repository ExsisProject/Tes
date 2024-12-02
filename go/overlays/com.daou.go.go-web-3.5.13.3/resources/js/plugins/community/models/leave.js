define([
    "backbone"
],

function(Backbone) {
	var CommunityLeave = Backbone.Model.extend({
		url: function() {
			return "/api/community/leave";
		}
	});
	return CommunityLeave;
});