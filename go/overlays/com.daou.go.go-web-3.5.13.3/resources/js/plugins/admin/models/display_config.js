define([
    "backbone"
],

function(Backbone) {
	
	var DisplayConfig = Backbone.Model.extend({
		url: function() {
			if(this.get('admin')){
				return "/ad/api/displayconfig";
			}else{
				return "/api/displayconfig";
			}
		}
	},
	{
		get : function(opt){
			var instance = new DisplayConfig();
			instance.set({ admin : opt.admin ? opt.admin : false });
			instance.fetch({async:false});
			return instance;
		}
	}
	); 
	
	return {
		read : function(opt){
			return displayConfig = DisplayConfig.get(opt);
		}
	};
});