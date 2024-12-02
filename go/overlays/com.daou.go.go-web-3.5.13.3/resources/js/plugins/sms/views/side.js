define('sms/views/side', function(require) {
	
	// dependency
	var Backbone = require('backbone');
	var App = require('app');
	
	var smsLang = require("i18n!sms/nls/sms");
	
	var sideTmpl = require('hgn!sms/templates/side');	
	
	var lang = {
			"문자발송" : smsLang["문자 발송"],
			"문자작성" : smsLang["문자 작성"],
			"발송문자내역" : smsLang["발송 문자 내역"]
		}
	
	var SmsSideView = Backbone.View.extend({

		events : {
			"click #smsHome" : 'smsHome',
			"click #sendSms" : 'sendSms',
			"click a[data-url='sms']" : "smsHome"
		},
		
		className : "go_side",
		
		initialize: function() {
			
		},
		
		render: function() {
			this.$el.html(sideTmpl({
				lang : lang
			}));
		},
		
		smsHome : function() {
			App.router.navigate("sms", true);
		},
		
		sendSms : function() {
			App.router.navigate("sms/send", true);
		}
		
	});
	return SmsSideView;
});