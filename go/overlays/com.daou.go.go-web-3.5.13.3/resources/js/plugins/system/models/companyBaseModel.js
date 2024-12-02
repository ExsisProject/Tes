define([
    "backbone"
],

function(Backbone) {
	
	
	var instance = null;
	var CompanyBaseModel = Backbone.Model.extend({
		url: function() {
			
			return "/ad/api/company";
		}
	}, {
		get: function(siteId) {
			if(instance == null) instance = new CompanyBaseModel();
			instance.siteId = siteId;
			instance.fetch({async:false});
			return instance;
		},
		create : function() {
	        if(instance == null) instance = new CompanyBaseModel();
	        return instance;
	    }
	}); 
	
	return {
		create : function(){
		    return companyBaseModel = CompanyBaseModel.create();
		},
		get : function(){
			return companyBaseModel = CompanyBaseModel.get(this.siteId);
		}
	};
});