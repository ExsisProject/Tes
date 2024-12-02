define([
        "backbone"
    ],

    function(Backbone) {
    	
    	var instance = null;
    	var ContactCopyMenuGroups = Backbone.Model.extend({
    		
    		url: function(){
                return GO.contextRoot + "api/contact/copy/menu/groups?" + this.getParams();
            },

            setType : function(type){
    			this.type = type;
    		},
    		
    		setDeptId : function(deptId){
    			this.deptId = deptId;
    		},
    		
            getParams : function(){
                var param = {};
                param["type"] = this.type;
                param["deptid"] = this.deptId;
                return $.param(param);
            }

    	}, {
    		get: function(opt) {
    			if(instance == null) instance = new ContactCopyMenuGroups();
    			instance.setType(opt.type);
    			instance.setDeptId(opt.deptId);
    			instance.fetch({async:false});
    			return instance;
    		},
            init : function(){
                return new ContactCopyMenuGroups();
            }
    	}); 
    	
    	return {
    		read : function(opt){
    			return ContactCopyMenuGroups.get(opt);
    		},
            init : function(){
                return ContactCopyMenuGroups.init();
            }
    	};
    });