define([
    "backbone"
],

function(Backbone) {

	var instance = null;
	var DirectedApproverModel = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/approver/"
		}
	}, {
		get: function() {
			if(instance == null) instance = new DirectedApproverModel();
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return DirectedApproverModel;
});