define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var LicenseModel = Backbone.Model.extend({
		url: function() {
			return "/ad/api/license";
		}
	},
	{
		get : function(){
			var instance = new LicenseModel();
			instance.set({silent:true});
			instance.fetch({async:false});
			return instance;
		}
	}
	); 
	
	return {
		read : function(){
			return licenseModel = LicenseModel.get();
		}
	};
});