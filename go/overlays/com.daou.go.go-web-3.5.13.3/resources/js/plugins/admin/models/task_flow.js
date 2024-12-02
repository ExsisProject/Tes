define([
    "backbone"
],
function(Backbone) {
	var Flow = Backbone.Model.extend({
		initialize : function() {
		},
		
		defaults : {
			beforeStatus : "",
			nextStatus : "",
			actionName : "",
			actionRoles : [],
			pushRoles : [] 
		},
		
		isFirst : function() {
			return this.get("beforeStatus") == null;
		},
    });
	return Flow;
});
