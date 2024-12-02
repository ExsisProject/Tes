define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var UpcomingCountModel = Backbone.Model.extend({
		url: function() {
			var url = '/api/approval/upcoming/count';
			return url;
		}
	}, {
		get: function() {
			if(instance == null) instance = new UpcomingCountModel();
			instance.fetch({data : {} ,async:false});
			return instance;
		}
	}); 
	
	return UpcomingCountModel;
});