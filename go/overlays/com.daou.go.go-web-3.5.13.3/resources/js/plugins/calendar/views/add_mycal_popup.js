(function() {
	
	define([
        "calendar/models/calendar", 
        "hgn!calendar/templates/add_mycal_popup", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        "jquery.go-popup"
    ], 
    
    function(
		CalendarModel,
		template,
		CommonLang,
		CalendarLang
	) {
		var MAX_NAME_LENGTH = 32, 
			MIN_NAME_LENGTH = 1;
		
		function MyCalendarAddPopup(options) {
			var defer = $.Deferred(), 
				popup, popOpts;
			
			popOpts = _.extend({
	            header: CalendarLang["내 캘린더 추가"], 
	            width: '300px', 
	            modal: false, 
	            pclass: "layer_normal layer_add_mailbox", 
	            contents: template({
	                "message": CalendarLang["내 캘린더 추가 팝업 메시지"]
	            }), 
	            buttons : [{
	                'btext' : CommonLang["확인"],
	                'btype' : 'confirm',
	                'autoclose' : false,
	                'callback' : _.bind(function(el) {
	                	submitForm(el).then(defer.resolve, defer.reject);
	                }, this)
	            }, {
	                'btext' : CommonLang["취소"], 
	                'btyle' : 'cancel'
	            }]
	        }, options || {});
			
			popup = $.goPopup(popOpts);
			
			$(popup).on('submit', 'form[name=form-add-mycal]', function(e) {
				e.preventDefault();
				submitForm(popup).then(defer.resolve, defer.reject);
			});			
			
			return defer;
		}
		
		function submitForm(el) {
			
			var $el = $(el), 
				$form = $el.find('form[name=form-add-mycal]'), 
	    		calName = $el.find('input[name="name"]').val(), 
	    		defer = $.Deferred();
			
	    	if(validateName($form)) {
	    		(new CalendarModel).addMyCalendar(calName).then(function() {
	    			el.close();
	    			defer.resolve.apply(defer, arguments);
	    		}, defer.reject);
	    	}
	    	
	    	return defer;
		}
		
		function validateName($form) {
			var $name = $form.find('input[name="name"]'), 
				calName = $name.val();

			if(MIN_NAME_LENGTH > calName.length || calName.length > MAX_NAME_LENGTH) {
				$.goError(GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."], { "arg1": MIN_NAME_LENGTH, "arg2": MAX_NAME_LENGTH }),  $name);
				$name.addClass('enter error');
				return false;
			}

			if ($.goValidation.containsInvalidFileNameCharacter(calName)) {

				/**
				 * CalDAV에서 URL에 캘린더명을 사용하므로,
				 * Tomcat에서 받아주지 않는 backslash(시스템 프로퍼티인 ALLOW_BACKSLASH 참고) 비허용
				 * 그 외에도 milton이 caldav를 webdav를 기반으로 구현하므로 파일에 넣을 수 없는 특수 문자들 함께 비허용 (예방 차원이므로 세부 구현 확인 후 제거 가능)
				 */
				$.goError(GO.i18n(CommonLang["파일명 특수 문자 불가"]),  $name);
				$name.addClass('enter error');
				return false;
			}

			return true; 
		}
		
		return MyCalendarAddPopup;
		
	});
	
})();