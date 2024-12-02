define([
    "backbone" 
],

function(
		Backbone
) {	
	var DutyList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return GO.contextRoot + "ad/api/duty/list";
		}
	}); 
	
	return {
		getCollection: function() {
			var dutyListCollection = new DutyList();
            dutyListCollection.fetch({
				async : false,
				contentType : 'application/json'
				});
			return dutyListCollection;
		}		
	};	
});