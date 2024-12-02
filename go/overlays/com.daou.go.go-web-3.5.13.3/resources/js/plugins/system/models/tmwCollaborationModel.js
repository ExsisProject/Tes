define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var TmwCollaborationModel = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/tmw";
		}
	},
	{
		get : function(){
			var instance = new TmwCollaborationModel();
			instance.set({silent:true});
			instance.fetch({async:false});
			return instance;
		}
	}
	); 
	
	return {
		read : function(){
			return tmwCollaborationModel = TmwCollaborationModel.get();
		}
	};
});