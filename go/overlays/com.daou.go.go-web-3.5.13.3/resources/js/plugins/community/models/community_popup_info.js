define([
    "backbone"
],

function(Backbone) {
	
	var CommunityPopupInfo = Backbone.Model.extend({
		url : function() {
			return [ "/api/community/info", this.communityId].join('/');
		},		
		
		setCommunityId : function(options){
			this.communityId = options.communityId;
		}
		
	});
	
	return {
		read : function(opt){
			var communityPopupInfo = new CommunityPopupInfo();
			communityPopupInfo.setCommunityId(opt);
			communityPopupInfo.fetch({async:false});
			return communityPopupInfo;
		}
	}
});