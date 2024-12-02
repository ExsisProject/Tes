define([
    "backbone",
    "admin/models/task_flow"
],

function(
		Backbone,
		Flow
) {	
	
	var Flows = Backbone.Collection.extend({
		model : Flow,
		
		initialize : function() {
		},
		
		url : function() {
		},

		
		addFirstFlow : function(status, pushRoles) {
			this.unshift(new Flow({
				beforeStatus : null,
				nextStatus : status || "",
				pushRoles : pushRoles
			}));
		},
		
		
		firstNotiList : function() {
			return this.at(0).get("pushRoles");
		},
		
		
		transitions : function() {
			var transitions = this.clone();
			transitions.shift();
			return transitions;
		}
	}); 
	
	return Flows;
});