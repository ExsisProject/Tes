define([
    "backbone" 
],

function(
		Backbone
) {	
	var UserVirtualDomainList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return GO.contextRoot + "ad/api/virtualdomains";
		}
	}); 
	
	return {
		getCollection: function() {
			var userVirtualDomainList = new UserVirtualDomainList();
			userVirtualDomainList.fetch({ 
				async : false,
				contentType : 'application/json'
				});
			return userVirtualDomainList;
		}		
	};	
});