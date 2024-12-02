(function() {
	
	define([
        'amplify', 
        'app', 
        'i18n!nls/commons', 
        'i18n!survey/nls/survey', 
        'jquery.go-popup'
    ], 
    
    function(
		amplify, 
		GO, 
		CommonLang, 
		SurveyLang
	) {
		
		var SurveyUtil = {
			goToLastList: function() {
	        	var storeKey = GO.session('id') + '-survey-lastcate',
	        		savedCategory = GO.util.store.get( storeKey ), 
	        		urlPostfix = '';

	            if(savedCategory) {
	                urlPostfix = '/list/' + savedCategory;
	            } else {
	                urlPostfix = '/dashboard';
	            }
	            
	            GO.router.navigate('survey' + urlPostfix, {trigger: true, pushState: true});
	        }, 
	        
	        getStringLengthError: function(min, max) {
	        	return GO.i18n(SurveyLang["텍스트 길이 검증 오류 메시지"], {"min": min, "max": max});
	        }, 
	        
	        alert: function(title, msg, btnText) {
	        	msg = msg || '';
	        	
	        	if(GO.config('deviceType') !== 'mobile') {
	        		$.goAlert(title, msg, '' ,btnText);
	        	} else {
	        		window.alert($('<p>' + title + '\n' + msg + '</p>').text());
	        	}
	        }, 
	        
	        confirm: function(title /*,msg, callback*/) {
	        	var args = [].slice.call(arguments, 1), 
	        		msg, callback;
	        	
	        	// callback을 먼저 뽑아낸다.
	        	if(args.length > 0) {
	        		callback = args.pop();
	        	}
	        	
	        	msg = args.pop() || '';
	        	
	        	if(GO.config('deviceType') !== 'mobile') {
	        		$.goConfirm(title, msg, callback);
	        	} else {
	        		var confirmMsg = title;
	        		if(!!msg) {
	        			confirmMsg += '\n' + msg;
	        		}
	        		
	        		if(window.confirm(confirmMsg)) {
	        			callback();
	        		}
	        	}
	        }, 
	        
	        raiseRequestError: function() {
	        	var msg = CommonLang["500 오류페이지 타이틀"];
	        	this.alert(msg);
	        },
	        raiseRequestError: function(title, description) {
	        	this.alert(title, description);
	        }
		};
		
		return SurveyUtil;
	});
	
})();