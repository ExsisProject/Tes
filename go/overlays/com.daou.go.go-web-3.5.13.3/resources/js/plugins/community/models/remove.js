define([
    "backbone"
],

function(Backbone) {
	var CommunityJoin = Backbone.Model.extend({
		url: function() {
			return [ "/api/community", this.communityId, "remove"].join('/');
		},		
		setCommunityId : function(communityId){
			this.communityId = communityId;
		}
	});
	return CommunityJoin;
});