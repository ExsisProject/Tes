define([
        "backbone"
    ],

    function(Backbone) {
    	
    	var instance = null;
    	var DomainCodeById = Backbone.Model.extend({
    		url: function() {
    			return "/ad/api/domaincode/" + this.id;
    		}
    		
    	}, {
    		get: function(codeId) {
    			instance = new DomainCodeById();
    			instance.set("id", codeId, {silent: true});
    			instance.fetch({async:false});
    			return instance;
    		}
    	}); 
    	
    	return {
    		read : function(codeId){
    			return DomainCodeByIdModel = DomainCodeById.get(codeId);
    		}
    	};
    });