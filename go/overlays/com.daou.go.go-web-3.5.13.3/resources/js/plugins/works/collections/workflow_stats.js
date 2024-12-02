define('works/collections/workflow_stats', function(require) {
	// dependency
	var Backbone = require('backbone');
	var GO = require('app');
	var when = require('when');
	var Stat = require('works/models/applet_simple');

	
    var Stats = Backbone.Collection.extend({
    	model : Stat,
    	comparator : 'seq',
		isDelete : function(stateName) {
			if (!stateName) return false;
			var names = _.map(this.models, function(model) {
				return model.get("name");
			});
			return !_.contains(names, stateName);
		},
		firstFlow : function() {
			return this.findWhere({start : true}) || new Stat({name : ""});
		}
    });
	
	return Stats;
});