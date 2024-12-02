define([
    "backbone",
    "admin/models/task_state"
],

function(
		Backbone,
		State
) {	
	var States = Backbone.Collection.extend({
		model : State,
		
		initialize : function() {
		},
		
		
		isDelete : function(stateName) {
			if (!stateName) return false;
			var names = _.map(this.models, function(model) {
				return model.get("name");
			});
			
			return !_.contains(names, stateName);
		},
		
		
		firstFlow : function() {
			return this.findWhere({start : true}) || new State({name : ""});
		}
	}); 
	
	return States;
});