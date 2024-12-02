define('sms/models/access_config', function(require) {
	
	// dependency
	var Backbone = require('backbone');
	var GO = require('app');
	
	var instance = null;
	
	var SmsAccessConfigModel = Backbone.Model.extend({
		
		url: function() {
			return GO.config('contextRoot') + 'api/sms/access'; 
		},

		isSms: function() {
			return this.get('accessSms');
		},
		
		isLms: function() {
			return this.get('accessLms');			
		},
		
		isMms: function() {
			return this.get('accessMms');			
		}	
	});
	
	return SmsAccessConfigModel;
});