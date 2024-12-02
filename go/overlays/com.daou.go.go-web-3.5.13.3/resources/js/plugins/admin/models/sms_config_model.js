define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var SmsConfig = Backbone.Model.extend({
		url: function() {
			if(this.get('admin')){
				return "/ad/api/sms/config";
			}else{
				return "/api/sms/config";
			}
		},
	}, {
		get: function(opt) {
			if(instance == null) instance = new SmsConfig();
			instance.set({ admin : opt.admin ? opt.admin : false });
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return {
		read : function(opt){
			return SmsConfigModel = SmsConfig.get(opt);
		}
	};
});