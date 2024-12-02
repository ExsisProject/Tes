define([
    "backbone"
],

function(Backbone) {
	
	var CommunityUpdate = Backbone.Model.extend({
		url : function() {
			return [ "/api/community", this.get('id'), "update"].join('/');
		},
		
		read : function(opt){
			var communityUpdate = new CommunityUpdate();
			communityUpdate.set({ 'id' : opt.communityId }),
			communityUpdate.fetch({async:false});
			return communityUpdate;
		}
		
	});
	
	return CommunityUpdate;
});