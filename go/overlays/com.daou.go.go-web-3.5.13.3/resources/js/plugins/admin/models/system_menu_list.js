define([
        "backbone"
    ],

    function(Backbone) {
    	
    	var instance = null;
    	var MenuConfig = Backbone.Collection.extend({
    		url: function() {
    			return "/ad/api/systemmenulist";
    		},
    		
    		hasApp : function(appName) {
    			return _.isObject(_.find(this.models, function(model){
    				return model.get("appName") == appName;
				}));
    		}
    	}, {
    		get: function() {
    			if(instance == null) instance = new MenuConfig();
    			instance.set({silent:true});
    			instance.fetch({async:false});
    			return instance;
    		}
    	}); 
    	
    	return {
    		read : function(){
    			return menuConfig = MenuConfig.get();
    		}
    	};
    });