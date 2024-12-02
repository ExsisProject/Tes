define([
    "backbone"
],

function(Backbone) {
	
	
	var instance = null;
	var SiteConfigModel = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/company/" + this.siteId;//changed.
		}
	}, {
		get: function(siteId) {
			if(instance == null) instance = new SiteConfigModel();
			instance.siteId = siteId;
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return SiteConfigModel;
});