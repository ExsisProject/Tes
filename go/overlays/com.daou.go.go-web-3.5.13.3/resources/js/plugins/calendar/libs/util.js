(function() {
    define([
        "underscore", 
        "jquery", 
        "amplify", 
        "app"
    ], 
    
    function(
        _, 
        $, 
        amplify, 
        GO
    ) {
    	var STORE_PREFIX = GO.session("id");
        
        var CalendarUtil = {
            /**
            Store에 저장되어 있는 캘린더타입을 반환(기본값은 monthly)
    
            @method getSavedCalendarType
            @return {String} 문자열            
            */
            getSavedCalendarType: function() {
                return GO.util.store.get(STORE_PREFIX + '-calendar-viewtype');
            }, 
            
            getSavedBasedate: function() {
                return GO.util.store.get(STORE_PREFIX + '-calendar-basedate') || GO.util.now().format("YYYY-MM-DD");
            }, 
            
            getSavedSelectedCalendar: function() {
                return GO.util.store.get(STORE_PREFIX + '-calendar-selected');
            },

            getSavedSelectedCalendarOwnerId: function() {
                return GO.util.store.get(STORE_PREFIX + '-calendar-selected-ownerid');
            },

            getSavedFeedFoldState: function() {
            	return GO.util.store.get(STORE_PREFIX + '-calendar-feed-folded');
            }, 
            
            getSavedCalendarFoldState: function() {
            	return GO.util.store.get(STORE_PREFIX + '-calendar-calendar-folded');
            }, 
            
            getSavedCalendarId: function() {
            	return GO.util.store.get(STORE_PREFIX + '-calendar-saved-calendarid');
            },
            
            saveCalendarType: function( type ) {
                return GO.util.store.set(STORE_PREFIX + '-calendar-viewtype', type);
            }, 
            
            //마지막으로 등록한 calendarid 저장
            saveCalendarId: function( calendarId ) {
            	var store = GO.util.store;
            	return store.set( 
        			STORE_PREFIX + '-calendar-saved-calendarid', 
        			calendarId, 
        			{type: 'session'} 
    			);
            },
            
            saveBasedate: function( basedate ) {
            	var store = GO.util.store;
            	return store.set( 
        			STORE_PREFIX + '-calendar-basedate', 
        			GO.util.toMoment(basedate).format("YYYY-MM-DD"), 
        			{type: 'session'} 
    			);
            },
            
            saveSideFoldState: function( type, bool ) {
            	GO.util.store.set( STORE_PREFIX + '-calendar-' + type + '-folded', bool ? 'Y' : 'N' );
            }, 
            
            saveCheckedCalendar: function( calendarIds ) {
                var ids = $.isArray(calendarIds) ? calendarIds : [calendarIds], 
            		store = GO.util.store;
                
                return store.set( STORE_PREFIX + '-calendar-selected', ids.join(","));
            },

            saveCheckedCalendarOwnerId: function( calendarOwnerIds ) {
                var ids = $.isArray(calendarOwnerIds) ? calendarOwnerIds : [calendarOwnerIds],
                    store = GO.util.store;

                return store.set( STORE_PREFIX + '-calendar-selected-ownerid', ids.join(","));
            },

            /**
            URL용 Date 문자열 만들기
    
            @method _getDateForType
            @private
            @return {String} 문자열            
            */
            getDateForUrl: function( type, date ) {
                var basedate = GO.util.toMoment(date || new Date()).clone(), 
                    pdate = basedate.format("YYYY-MM-DD");
            
                if(type === "monthly") {
                    pdate = basedate.format("YYYY-MM");
                }else if(type === "agenda" && !GO.util.isThisMonth(date)){ //GO-12058
                	pdate = basedate.format("YYYY-MM-01");
                }
                
                return pdate;                
            }, 
            
            /**
            목록용 URL 반환
                - 쿠키에 저장된 타입이 있으면 해당 타입을 이용, 없으면 기본값 'monthly'
    
            @method getCalendarUrl
            @private
            @return {String} 문자열            
            */
            getCalendarUrl: function( date ) {
                var type = this.getSavedCalendarType();
                return type ? ["calendar", type, this.getDateForUrl( type, date )].join("/") : "calendar";
            }, 
            
            /**
            캘린더로 돌아가기
                - localStorage 저장된 basedate가 있으면 해당 캘린더로, 없으면 오늘이 속한 캘린더로 이동
    
            @method goToCalendar
            @private
            @return {String} 문자열
            */
            goToCalendar: function() {
                var basedate = this.getSavedBasedate();
                GO.router.navigate(this.getCalendarUrl(basedate), {trigger: true, pushState: true});
                return this;
            }, 
            
            /**
            Event 모델 파싱
                - CalendarEvent 모델의 parse 함수를 통해 모델의 권한을 추가로 부여하는데, parse 함수는 fetch와 save 함수에서만 동작
                - 따라서, pool을 이용할 경우에는 별도로 해주어야 함

            @method parseEventModel
            @param {Object} tevent 모델데이터
            @param {boolean} 전사캘린더 운영자 여부
            @static
            */ 
            parseEventModel: function(tevent, isManager) {
                // XSS 보안취약점 대응
                tevent.summary = GO.util.XSSFilter( tevent.summary );
                tevent.location = GO.util.XSSFilter( tevent.location );
                tevent.description = GO.util.XSSFilter( tevent.description );
                tevent.htmlLink = GO.util.XSSFilter( tevent.htmlLink );

                // 공휴일 경우 (-)로 시작하는 summary는 출력하지 않도록 변경
                if(isHolidayEvent(tevent) && /^\-(.*)/i.test(tevent.summary)) {
                    tevent.summary = '';
                }

                tevent.auth = hasAuthForEvent(tevent, typeof isManager === 'undefined' ? true : isManager);
                
                return tevent;
            }, 
            
            triggerReloadFeeds: function() {
            	$(document).trigger("reload:calendar-feeds");
            }, 
            
            triggerRemoveFeed: function() {
            	$(document).trigger("removed:calendar-feeds");
            }, 
            
            bindDatepickerIcon: function(jqEl, ns) {
                jqEl.on("click." + ns, ".ic_calendar", function(e) {
                    $(e.currentTarget)
                        .parent()
                        .find('.hasDatepicker')
                        .focus();
                });
            }
        };
        
        function hasAuthForEvent(tevent, isManager) {
        	isManager = isManager || false;

        	/*
             * 권한검사 순서
             * 	1. 참석자이면 권한 있음
             * 	2. 전사일정이고 운영자이면 권한 있음
             * 
             * 그외에는 권한 없음...
             */
//        	if(_.where(tevent.attendees, {id: GO.session("id")}).length > 0) {
//	        	return true;
//	        }
        	
        	if(tevent.type === 'company' && isManager) {
        		return true;
        	}
        	
        	return false;
        }

        function isHolidayEvent(tevent) {
            return tevent.type === 'holiday';
        }
        
        return CalendarUtil;
    });
}).call(this);