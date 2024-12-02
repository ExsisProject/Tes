define([
    "backbone"
],

function(
		Backbone
		) {
    var SmsRepNumber = Backbone.Model.extend({
    	
    	initialize : function(data) {
    		this.type = data.type ? data.type : "";
    	},
    	
    	urlRoot : function() {
    		var url = GO.contextRoot;
        	if(this.type == "company"){
        		url += "ad/"
        	}
			url += "api/sms/repnumber";
    		return url;
    	},
    	
        getRepNumber: function() {
        	return this.get('repNumber');
        },
        
        getName: function() {
        	return this.get('name');
        },
        
        isNormal: function() {
        	return this.get("status") == "NORMAL";
        },
        
        setInitData : function(){
            this.set({
            	name : "",
            	number : "",
                status : "NORMAL"
            });
        }
        
    }); 
    return SmsRepNumber;
});