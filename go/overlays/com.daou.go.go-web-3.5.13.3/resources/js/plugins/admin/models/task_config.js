define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var TaskConfig = Backbone.Model.extend({
		url: function() {
			if(this.get('admin')){
				return "/ad/api/task/config";
			}else{
				return "/api/task/config";
			}
		},
	}, {
		get: function(opt) {
			if(instance == null) instance = new TaskConfig();
			instance.set({ admin : opt.admin ? opt.admin : false });
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return {
		read : function(opt){
			return TaskConfigModel = TaskConfig.get(opt);
		}
	};
});