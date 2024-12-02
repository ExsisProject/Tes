define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var TodoViewerCountModel = Backbone.Model.extend({
		url: function() {
			var url = '/api/approval/todoviewer/count';
			return url;
		}
	}, {
		get: function() {
			if(instance == null) instance = new TodoViewerCountModel();
			instance.fetch({data : {} ,async:false});
			return instance;
		}
	}); 
	
	return TodoViewerCountModel;
});