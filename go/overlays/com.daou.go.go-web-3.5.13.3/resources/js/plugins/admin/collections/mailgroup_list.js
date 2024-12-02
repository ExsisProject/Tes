define([
    "backbone" 
],

function(
		Backbone
) {	
	var MailGroupList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return GO.contextRoot + "ad/api/mailgroups";
		}
	}); 
	
	return {
		getCollection: function() {
			var mailGroupList = new MailGroupList();
			mailGroupList.fetch({ 
				async : false,
				contentType : 'application/json'
				});
			return mailGroupList;
		}		
	};	
});