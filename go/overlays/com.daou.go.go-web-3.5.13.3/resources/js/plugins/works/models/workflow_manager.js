define('works/models/workflow_manager', function(require) {
	// dependency
	var Backbone = require('backbone');
	var GO = require('app');
	var when = require('when');

	var WorkflowModel = Backbone.Model.extend({
    	url : function(){
    		return GO.config('contextRoot') + 'api/works/applets/' + this.get('id') + '/process';
    	},
		defaults : {
			useProcess : false,
			statuses : [],
			transitions : []
		}
	});
	
	return WorkflowModel;
});