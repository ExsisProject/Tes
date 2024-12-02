(function() {
    
    define([
        "underscore", 
        "app", 
        "calendar/collections/calendars", 
        "i18n!calendar/nls/calendar",
        "calendar/libs/util"
    ], 

    function(
        _, 
        GO, 
        Calendars, 
        calLang, 
        CalUtil
    ) {
        var // 상수 정의
            SUMMARY_MAX_LENGTH = 500, 
            LOCATION_MAX_LENGTH = 500, 
            DESCRIPTION_MAX_LENGTH = 4000;

        var CalendarEvent = GO.BaseModel.extend({
            recurChangeType: null, 
            originCalendarId: null, 
            
            url: function() {
            	var calendarId = this.originCalendarId || this.get("calendarId");
                return [
                    "/api/calendar/", calendarId, "/event/", this.id, this.isMove ? "/move" : "", 
                    (!!this.recurChangeType ? "?" + $.param({ "recurChangeType": this.recurChangeType }) : "")
                ].join("");
            }, 
            
            initialize: function(attrs, options) {
            	// 멀티 캘린더가 되면서 수정시 원래 아이디를 남겨야 한다...
            	if(attrs && attrs.hasOwnProperty('calendarId')) {
            		this.originCalendarId = attrs['calendarId'];
            	}
                this.recurChangeType = null;
            }, 

            validate: function(attrs) {
                var passed = false, 
                    errorName = "error:validate";
                var internalAttendees = _.filter(attrs.attendees, function(attendee){
             		return !_.isUndefined(attendee.id);
             	});
                
                if(!attrs.summary) {
                    this.trigger(errorName, this, "required:summary", calLang["일정명을 입력하세요"]);
                } 
                else if(!attrs['calendarId']) {
                	this.trigger(errorName, this, "required:calendarId", calLang["캘린더 미선택 메시지"]);
                }
                else if(attrs.summary.length > SUMMARY_MAX_LENGTH) {
                    this.trigger(errorName, this, "max:summary", GO.i18n(calLang["일정명은 {{max}}자 이하로 입력해 주십시오"], "max", SUMMARY_MAX_LENGTH));
                } 
                else if(!attrs.startTime) {
                    this.trigger(errorName, this, "required:startTime", calLang["시작일자를 입력해 주십시오"]);
                } 
                else if(!attrs.endTime) {
                    this.trigger(errorName, this, "required:startTime", calLang["종료일자를 입력해 주십시오"]);
                } 
                else if(attrs.location && attrs.location.length > LOCATION_MAX_LENGTH) {
                    this.trigger(errorName, this, "max:location", GO.i18n(calLang["장소는 {{max}}자까지 가능합니다"], "max", LOCATION_MAX_LENGTH));
                } 
                
                else if(attrs.type === 'normal' && ((attrs.attendees && attrs.attendees.length <= 0) || _.isEmpty(internalAttendees))) {
                    // 참석자 체크는 등록페이지에서만 필요
                    if(this.isNew()) {
                        this.trigger(errorName, this, "required:attendees", calLang["참석자를 지정해 주십시오"]);
                    } else {
                        passed = true;
                    }
                } 
                else if(attrs.reminders) {
                    for(var i=0, len=attrs.reminders.length; i<len;i++) {
                        var curAttr = attrs.reminders[i], 
                            time = curAttr.time, 
                            intTime = parseInt(time);
                        if(!/^[\-\+]?[\d\,]*\.?[\d]*$/.test(time)) {
                            this.trigger(errorName, this, "numeric:reminder_time", calLang["미리알림 값은 숫자만 가능합니다"], i);
                            return true;
                        }
                        
                        if(intTime < 0) {
                            this.trigger(errorName, this, "min:reminder_time", calLang["미리알림 값은 최소 0이상이어야 합니다"], i);
                            return true;
                        }
                        
                        if(intTime > 10000) {
                            this.trigger(errorName, this, "max:reminder_time", GO.i18n(calLang["미리알림 값은 최대 {{max}}이하이어야 합니다"], "max", 10000), i);
                            return true;
                        }
                    }
                    passed = true;
                }
                else {
                    passed = true;
                }

                return !passed;
            }, 
            
            parse: function(resp, xhr) {
                var data = GO.BaseModel.prototype.parse.call(this, resp, xhr);
                
                return CalUtil.parseEventModel(data, Calendars.isCalendarManager());
            }, 

            isCreator: function(userid) {
                return !!(this.get("creator").id === userid);
            }, 
            
            isCompanyEvent: function() {
                return this.get("type") === "company";
            }, 
            
            isNormalEvent: function() {
                return this.get("type") === "normal";
            }, 
            
            isHolidayEvent: function() {
                return this.get("type") === "holiday";
            }, 

            isRecurrence: function() {
                return !!this.get("recurrence");
            }, 
            
            isEmptyAttendees: function() {
                return !(this.get("attendees").length > 0);
            }, 
            
            isIncludedAttendee: function(userid) {
                return !!(_.where(this.get("attendees"), {id: parseInt(userid)}).length > 0);
            }, 
            
            setRecurChangeType: function(type) {
                this.recurChangeType = type;
            }, 
            
            isAllday: function() {
                return this.get("timeType") === "allday";
            }, 
            
            isPublic: function() {
                return this.get("visibility") === "public";
            }, 
            
            isPrivate: function() {
                return this.get("visibility") === "private";
            }, 
            
            isTimed: function() {
                return this.get("timeType") === "timed";
            },
            
            hasPermission: function(userid) {
                var perm = false;
                if(this.isCompanyEvent() || this.isHolidayEvent()) {
                    perm = false;
                } else if(this.isCreator(userid)) {
                    perm = true;
                } else if(this.isIncludedAttendee(userid)) {
                    perm = true;
                }
                
                return perm;
            },
            
            getExternalAttendees : function() {
            	return _.filter(this.get("attendees"), function(attendee) {
            		return _.isUndefined(attendee.id);
            	});
            },
            
            hasExternalAttendees : function() {
            	return this.getExternalAttendees().length > 0;
            },
            
            isAlone : function() {
            	var attendees = this.get("attendees");
            	return attendees
                    && (attendees.length - this.getExternalAttendees().length) == 1
                    && attendees[0].id == GO.session().id;
            }
        });

        return CalendarEvent;
    });

}).call(this);