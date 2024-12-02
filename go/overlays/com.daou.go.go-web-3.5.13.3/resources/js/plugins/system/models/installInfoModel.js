define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var InstallInfoModel = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/install/info";
		}
	},
	{
		get : function(){
			var instance = new InstallInfoModel();
			instance.set({silent:true});
			instance.fetch({async:false});
			return instance;
		}
	}
	); 
	
	return {
		read : function(){
			return installInfoModel = InstallInfoModel.get();
		}
	};
});