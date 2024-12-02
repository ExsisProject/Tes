define([
    "backbone" 
],

function(
		Backbone, 
		Model
) {	
	var AccountCollection = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return GO.contextRoot+"ad/api/user/list";
		}
	}); 
	
	return {
		getCollection: function() {
			var accountCollection = new AccountCollection();
			accountCollection.fetch({ 
				async : false,
				contentType : 'application/json'
				});
			return accountCollection;
		}		
	};	
});