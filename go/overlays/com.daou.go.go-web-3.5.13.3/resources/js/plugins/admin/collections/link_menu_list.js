define([
    "backbone"
],

function(
		Backbone
) {	
	var LinkMenuList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return "/ad/api/messenger/links";
		}
	}); 
	
	return {
		getCollection: function() {
			var linkMenuList = new LinkMenuList();
			linkMenuList.fetch({ async : false });
			return linkMenuList;
		}		
	};	
});