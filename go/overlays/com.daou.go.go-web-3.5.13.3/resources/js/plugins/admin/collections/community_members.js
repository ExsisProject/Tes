define([
    "backbone"
],

function(
		Backbone
) {	
	var instance = null;
	var CommunityMembers = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return [GO.contextRoot+"ad/api/community", this.communityId ,"member"].join('/');
		},
		setVariables : function(communityId){
			this.communityId = communityId;			
		}
	}); 
	
	return {
		getCollection: function(communityId) {			
			instance = new CommunityMembers();
			instance.setVariables(communityId);			
			instance.fetch({ async : false });
			return instance;
		}		
	};	
});


