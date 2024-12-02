define([
    "backbone"
],

function(Backbone) {
	var CommunityJoin = Backbone.Model.extend({
		url: function() {
			return "/api/community/create";
		}
		
	}); 
	return CommunityJoin;
});