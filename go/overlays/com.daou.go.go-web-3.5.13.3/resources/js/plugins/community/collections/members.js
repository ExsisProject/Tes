define([
    "backbone",
    "community/models/members" 
],

function(
		Backbone, 
		Model
) {	
	var instance = null;
	var Members = Backbone.Collection.extend({
		model : Model,
		url: function() {
			return "/api/community/"+this.communityId+"/joinmembers";
		},
		setVariables : function(communityId){
			this.communityId = communityId;			
		}
	}); 
	
	return {
		getCollection: function(opt) {			
			instance = new Members();
			instance.setVariables(opt.communityId);
			instance.fetch({
				async : false
			});
			return instance;
		},
		
		create : function(){
		    return new Members();
		}
	};	
});


