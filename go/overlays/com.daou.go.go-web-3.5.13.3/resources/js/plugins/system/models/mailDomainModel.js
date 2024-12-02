define([
        "backbone"
    ],

    function(Backbone) {
    	
    	
    	var instance = null;
    	var MailDomainModel = Backbone.Model.extend({
    		url: function() {
    			if(this.get('id') == undefined){
    				return "/ad/api/system/domain";
    			}else{
    				return "/ad/api/system/domain/"+this.get('id');
    			}
    		}
    	}, {
    		get: function(domainId) {
    			if(instance == null) instance = new MailDomainModel();
    			instance.set("id", domainId, {silent:true});
    			instance.fetch({async:false});
    			return instance;
    		},
    		create : function() {
    	        if(instance == null) instance = new MailDomainModel();
    	        return instance;
    	    }
    	}); 
    	
    	return MailDomainModel;
    });
