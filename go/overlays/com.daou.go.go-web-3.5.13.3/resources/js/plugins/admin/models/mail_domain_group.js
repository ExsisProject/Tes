define([
    "backbone"
],

function(Backbone) {
	
	var MailDomainGroup = Backbone.Model.extend({
	    urlRoot: GO.contextRoot+"ad/api/mailgroup"
	}, {
		get: function(groupName) {
			var instance = new MailDomainGroup();
			instance.fetch({data : {name :  groupName}, async:false});
			return instance;
		}
	}); 
	
	return {
		read : function(groupName){
			return MailDomainGroup.get(groupName);
		},
	};
});