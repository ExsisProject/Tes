define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var ReceptionCountModel = Backbone.Model.extend({
		url: function() {
			var url = '/api/approval/reception/count';
			return url;
		}
	}, {
		get: function() {
			if(instance == null) instance = new ReceptionCountModel();
			instance.fetch({data : {} ,async:false});
			return instance;
		}
	}); 
	
	return ReceptionCountModel;
});