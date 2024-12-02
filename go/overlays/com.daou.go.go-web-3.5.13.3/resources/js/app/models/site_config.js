(function() {
define([
    "backbone"
],

function(Backbone) {
	
	var MailDomainConfig = Backbone.Model.extend({
	    
	    initialize : function(opts){
	        if(opts != undefined && opts.isAdmin){
	            this.isAdmin = true;
	        }else {
	            this.isAdmin = false;
	        }
	    },
	    
		url: function() {
		    if(this.isAdmin){
		        return GO.contextRoot+"ad/api/siteconfig";
		    }else{
		        return GO.contextRoot+"api/siteconfig";
		    }
		},
		
		hasApproval : function(){
		    if(this.get("approvalService") == "on"){
		        return true;
		    }else{
		        return false;
		    }
		}
	}); 
	
	return {
	    read : function(opts){
	        var instance = new MailDomainConfig(opts);
            instance.fetch({ 
                async : false,
                contentType : 'application/json'
                });
            return instance;
	    }
	};
});
}).call(this);