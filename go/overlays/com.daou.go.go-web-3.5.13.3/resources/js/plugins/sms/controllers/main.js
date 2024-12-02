define('sms/controllers/main', function(require) {
	
	var r = {};
	
	/**
	 * 문자발송 홈
	 */
	r.renderHome = function() {
	    require(['sms/views/home'], function(SmsHome) {	    	
	    	new SmsHome().render();	    	
	    });
	};
	
	/**
	 * 문자발송
	 */
	r.renderSmsSend = function() {
	    require(['sms/views/send'], function(SmsSend) {	    	
	    	new SmsSend().render();	    	
	    });
	};
	
	/**
	 * 문자 발송 상세 내역
	 */
	r.renderSmsDetail = function(smsMessageId) {
		require(['sms/views/detail'], function(SmsDetail) {
			var options = {"smsMessageId": smsMessageId};
			(new SmsDetail(options)).render();
		});
	},
	
	r.renderConnector = function() {
		require(["jquery", "sms/views/connector"], function( $, ConnectorView ) {
	        var view = new ConnectorView();
	        $('body').append(view.el);
	        view.render();
	    });
	}
	
	return r;
});