define([
    "backbone"
],
function(Backbone) {
	var model = Backbone.Model.extend({
		url : function() {
			return "/api/community/list/menu";
		},		
	});
	return model;
});