define('works/collections/workflow_flows', function(require) {
	// dependency
	var Backbone = require('backbone');
    return Backbone.Collection.extend({
		transitions : function() {
			var transitions = this.clone();
			transitions.shift();
			return transitions;
		},
		
		firstNotiList : function() {
			return this.at(0).get("pushRoles");
		},
		
		addFirstFlow : function(status, pushRoles) {
			this.unshift(new Backbone.Model({
				beforeStatus : null,
				nextStatus : status || "",
				pushRoles : pushRoles
			}));
		}
    });
});