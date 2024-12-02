define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var TodoCountModel = Backbone.Model.extend({
		url: function() {
			var url = '/api/approval/todo/count';
			return url;
		}
	}, {
		get: function() {
			if(instance == null) instance = new TodoCountModel();
			instance.fetch({data : {} ,async:false});
			return instance;
		}
	}); 
	
	return TodoCountModel;
});