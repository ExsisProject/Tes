/*
 * calendar collection
 * 로그인 사용자의 캘린더 정보들을 가져온다.
 */ 
(function() {
    define([
        "underscore", 
        "app", 
        "calendar/models/calendar"
    ], 

    function(
        _, 
        GO, 
        Calendar
    ) {          
        var __super__ = GO.BaseCollection.prototype;

        var Calendars = GO.BaseCollection.extend({
            model: Calendar, 
            url: function() {
                if(this.userId < 0) throw new Error("Invalid user id");
                return ["/api/calendar/user/", this.userId, "/calendar"].join("");
            }, 
            
            /**
             * 캘린더 숨길때 collection 지우지말고 플래그 처리.
             */
            isHide: false,

            /**
            목록을 조회할 사용자 고유 ID

            @property userId 
            @type Integer
            @default -1
            **/
            userId: -1, 

            /**
            목록을 조회할 사용자 고유 ID

            @property userId 
            @type Integer
            @default -1
            **/            
            __needFetch__: false, 

            initialize: function() {}, 
            
            comparator: 'seq', 

            /**
            모델 데이터가 믿을 수 있는지 여부 반환
                - __needFetch__가 false
                - 캐싱되었다면 파기되지 않았는지 검사

            @method isValid
            */ 
            isValid: function() {
                if(this.__needFetch__) return false;
                if(this.length <= 0) return false;
                return true;
            }, 

            /**
            조회할 캘린더 사용자 ID 설정

            @method setUserId
            */ 
            setUserId: function(userid) {
                if(userid !== this.userId) this.__needFetch__ = true;
                this.userId = userid;
                return this;
            }, 

            /**
            내 캘린더 목록 가져오기

            @method getMyCalendars
            @return {Array} 내일정 캘린더 모델 배열
            */ 
            getMyCalendars: function() {
                return this.getTypedCalendars("normal");
            }, 
            
            /**
            사용자 캘린더 목록 가져오기

            @method getUserCalendars
            @return {Array} 내일정 캘린더 모델 배열
            */ 
            getUserCalendars: function() {
                return this.filter(function(model) {
                    return _.contains(['normal', 'holiday'], model.get("type")); 
                });
            }, 
            
            getNewCompanyCalendarIds : function(){
                var ids = [];
                _.each(this.models, function(model){
                    if(model.get("newCompanyCalendar")){
                        ids.push(model.get("id"));
                    }
                });
                return ids;
            },
            
            /**
            전사일정 캘린더 가져오기

            @method getCompanyCalendars
            @return {Array} 전사일정 캘린더 모델 배열
            */ 
            getCompanyCalendars: function() {
                return this.getTypedCalendars("company");
            }, 
            
            /**
            공휴일 캘린더 가져오기

            @method getCompanyCalendars
            @return {Array} 공휴일 캘린더 모델 배열
            */ 
            getHolidayCalendars: function() {
                return this.getTypedCalendars("holiday");
            }, 
            
            /**
            타입별 캘린더 가져오기

            @method getCompanyCalendars
            @return {Array} 타입별 캘린더 모델 배열
            */
            getTypedCalendars: function(type) {
                return this.filter(function(model) {
                    return model.get("type") === type; 
                });
            }, 

            /**
            캘린더운영자 여부 가져오기

            @method isCalendarManager
            @return {boolean} 캘린더 운영자 여부
            */ 
            isCalendarManager: function() {
                var filtered = this.getWritableCompanyCalendars();
                return filtered.length > 0;
            },  
            
            /**
             등록 가능한 전사 캘린더 목록
             
             */
            getWritableCompanyCalendars : function(){
                var filtered = this.filter(function(model) {
                    return (model.get("type") === "company" && model.get("permission") === true); 
                });
                return filtered;
            },
            
            /**
            인스턴스 변수 초기화(override)

            @method _reset
            @private
            */ 
            _reset: function() {
                __super__._reset.call(this);
                this.__needFetch__ = false;
            }, 
            
            setDefaultCalendar: function(calendarId) {
            	var self = this, 
            		calendar = this.get(calendarId), 
            		defer = $.Deferred();
            	
            	calendar.updateDefaultCalendar().then(function() {
            		self.each(function(model) {
                		model.decideDefault(calendarId);
                	});
            		defer.resolve();
            	}, defer.reject);
            	
            	return defer;
            }

        }, {
            __instance__: null, 
            
            /**
            싱글톤 인스턴스 생성

            @method create
            @static
            @override
            */ 
            create: function() {
                if(this.__instance__ === null) {
                    this.__instance__ = new this.prototype.constructor();
                }
                return this.__instance__;
            }, 
            
            /**
            조회할 사용자 ID 설정

            @method setUserId
            @static
            @chainable
            */ 
            setUserId: function(userid) {
                var instance = this.getInstance();
                instance.setUserId(userid);
                return this;
            }, 
            
            /**
			사용자의 캘린더를 반환
            @method getMyCalendars
            @static
            */
            getMyCalendars: function() {
            	var instance = this.getInstance();
	            
	            if(!instance.length) {
	                instance.setUserId(GO.session("id")).fetch({async: false});
	            }
	            
	            return instance.getMyCalendars();
            }, 

            /**
			getMyCalendars 의 별칭 함수
			@deprecated
            @method getMyCalendar
            @static
            */ 
            getMyCalendar: function() {
                return this.getMyCalendars();
            },  
            
            /**
            로그인한 사용자의 기본 캘린더를 반환

            @method getDefaultCalendar
            @static
            */ 
            getDefaultCalendar: function() {
            	var myCalendars = this.getMyCalendar(), 
            		result;
            	result = _.filter(myCalendars, function(calendar) {
                    return calendar.get('defaultCalendar') === true;
            	}, this);
            	
            	return result[0] || myCalendars[0];
            }, 
            
            getCompanyCalendar: function() {
                var instance = this.getInstance(), 
                    calendars;
                
                if(!instance.length) {
                    instance.setUserId(GO.session("id")).fetch({async: false});
                }
                calendars = instance.getCompanyCalendars();
                
                return calendars || [];
            }, 
            
            isCalendarManager: function(userid) {
            	var instance = this.getInstance(), 
                	calendars;
            	
            	if(typeof userid === 'undefined') {
            		userid = GO.session('id');
            	}
            	this.setUserId(userid);
            	
            	return instance.isCalendarManager();
            },
            
            getWritableCompanyCalendars : function(userid){
                var instance = this.getInstance(), 
                    calendars;
                
                if(typeof userid === 'undefined') {
                    userid = GO.session('id');
                }
                this.setUserId(userid);
                
                return instance.getWritableCompanyCalendars();
            },
            
            getCalendars: function() {
                var instance = this.getInstance(), 
                    calendars;
                var deferred = $.Deferred();
                instance.setUserId(GO.session("id")).fetch({
                	async:false,
                	success: function() {
                		deferred.resolve(instance);
                	}
                });
                return deferred;               
            }, 
            
            
        });

        return Calendars;
    });
}).call(this);