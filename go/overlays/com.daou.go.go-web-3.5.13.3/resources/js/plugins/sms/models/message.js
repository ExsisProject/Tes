define('sms/models/message', function(require) {
	
	// dependency
	var Backbone = require('backbone');
	var GO = require('app');
	
	var SmsMessageInfoModel = Backbone.Model.extend({
		
		url: function() {
			return GO.config('contextRoot') + 'api/sms'; 
		}
	});
	
	return SmsMessageInfoModel;
});