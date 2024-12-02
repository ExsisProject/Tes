define([
    "backbone"
],

function(
		Backbone 
) {
	var instance = null;
	var CommunityBoards = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return [GO.contextRoot+"ad/api/community", this.communityId ,"statistic/boards"].join('/');
		},
		setVariables : function(communityId){
			this.communityId = communityId;			
		}
	}); 
	
	return {
		getCollection: function(communityId) {			
			instance = new CommunityBoards();
			instance.setVariables(communityId);			
			instance.fetch({ async : false });
			return instance;
		}		
	};	
});


