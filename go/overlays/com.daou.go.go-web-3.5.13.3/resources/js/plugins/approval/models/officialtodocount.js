define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var OfficialTodoCountModel = Backbone.Model.extend({
		url: function() {
			var url = '/api/approval/officialtodo/count';
			return url;
		}
	}, {
		get: function() {
			if(instance == null) instance = new OfficialTodoCountModel();
			instance.fetch({data : {} ,async:false});
			return instance;
		}
	}); 
	
	return OfficialTodoCountModel;
});