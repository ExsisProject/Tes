define([
    "backbone"
],

function(Backbone) {
	
	var CommunityInfo = Backbone.Model.extend({
		url : function() {
			return [ "/api/community", this.communityId].join('/');
		},		
		
		setCommunityId : function(options){
			this.communityId = options.communityId;
		}
		
	});
	
	return {
		read : function(opt){
			var communityInfo = new CommunityInfo();
			communityInfo.setCommunityId(opt);
			communityInfo.fetch({async:false});
			return communityInfo;
		}
	}
});