define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var CommunityConfig = Backbone.Model.extend({
		url: function() {
			if(this.get('admin')){
				return "/ad/api/communityconfig";
			}else{
				return "/api/communityconfig";
			}
			
		},
	}, {
		get: function(opt) {
			if(instance == null) instance = new CommunityConfig();
			instance.set({ admin : opt.admin ? opt.admin : false });
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return {
		read : function(opt){
			return communityConfigdModel = CommunityConfig.get(opt);
		},
		create : function(){
		    return new CommunityConfig();
		}
	};
});