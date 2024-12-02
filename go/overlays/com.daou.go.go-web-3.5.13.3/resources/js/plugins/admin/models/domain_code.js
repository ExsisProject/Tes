define([
    "backbone"
],

function(Backbone) {
	
	var DomainCode = Backbone.Model.extend({
		url: function() {
			return "/ad/api/domaincode/" + this.get('type');
		}
	}); 
	
	return DomainCode;
});