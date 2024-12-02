(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/appr_official_version",
    ], 
    function(
        $,
        Backbone,
        App,
        ApprOfficialVersionModel
    ) {

    	var ApprOfficialVersionCollection = Backbone.Collection.extend({
    		model : ApprOfficialVersionModel,
    		validateAddPosition : function(){
    			return true;
    		},
    		isEmptyReceiver : function(){
    			var isEmptyReceiver = true;
    			this.each(function(model){
    				if(model.get('receivers').length > 0){
    					isEmptyReceiver = false;
    				}
    			});
    			return isEmptyReceiver;
    		}
    	});

        return ApprOfficialVersionCollection;
        
    });
}).call(this);