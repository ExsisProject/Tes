define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var HostModel = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/host";
		}
	},
	{
		get : function(){
			var instance = new HostModel();
			instance.set({silent:true});
			instance.fetch({async:false});
			return instance;
		}
	}
	); 
	
//	return {
//		read : function(){
//			return HostModel = HostModel.get();
//		}
//	};
	return HostModel;
});