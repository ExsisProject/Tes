define([
    "backbone" 
],

function(
		Backbone
) {	
	var CommunityWaitList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return "/ad/api/community/list/wait";
		}
	}); 
	
	return {
		getCollection: function() {
			var waitListCollection = new CommunityWaitList();
			waitListCollection.fetch({ async : false });
			return waitListCollection;
		}		
	};	
});