define([
        "backbone"
    ],

    function(
    		Backbone
    ) {	
    	var CompanyConfig = Backbone.Collection.extend({
    		model : Backbone.Model,
    		url: function() {
    			return "/ad/api/submenutypelist";
    		}
    	}); 
    	
    	return {
    		getCollection: function() {
    			var companyConfig = new CompanyConfig();
    			companyConfig.fetch({ async : false });
    			return companyConfig;
    		}		
    	};	
    });