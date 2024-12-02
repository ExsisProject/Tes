define([
    "backbone"
],

function(Backbone) {
	var instance = null;
	var FMenu = Backbone.Model.extend({
		urlRoot: "/ad/api/fmenu"
	},
	{
		get: function (id) {
			if (instance == null) {
				instance = new FMenu()
			} else {
				instance.clear();
			}
			instance.set("id", id, {silent:true});
			instance.fetch({async:false});
			return instance;
		},
		create : function() {
	        if(instance == null) instance = new FMenu();
	        return instance;
	    }
	});
	
	return {
		read : function(id){
			return fmenu = FMenu.get(id);
		},
		create : function(){
		    return fmenu = FMenu.create();
		}
	};
});