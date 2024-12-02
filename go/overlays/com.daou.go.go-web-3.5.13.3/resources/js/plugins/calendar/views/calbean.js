(function() {
    "use strict";

    define([
        "backbone",
        "when",
        "app",
        "calendar/models/event", 
        "calendar/views/calendar",
        "calendar/libs/util", 
        
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar",
        "go-calendar", 
        "jquery.calbean"
    ], 

    function(
        Backbone,
        when,
        GO, 
        CalendarEvent,
        CalendarView,
        CalUtil,
        
        commonLang, 
        calLang, 
        GOCalendar
    ) {
        var // 상수 정의
            CUSTOM_EVENT_NS = 'calbeanview', 
            // CalbeanView 커스텀 이벤트
            EVENT_SHOW_CAL = [GO.constant("calendar", "EVENT_SHOW_CAL"), CUSTOM_EVENT_NS].join("."), 
            EVENT_HIDE_CAL = [GO.constant("calendar", "EVENT_HIDE_CAL"), CUSTOM_EVENT_NS].join("."), 
            EVENT_CHANGED_COLOR = [GO.constant("calendar", "EVENT_CHANGED_COLOR"), CUSTOM_EVENT_NS].join("."),
            
            // calbean 이벤트
            EVENT_SHOW_EVENT = [GO.constant("calendar", "EVENT_SHOW_EVENT"), CUSTOM_EVENT_NS].join("."), 
            EVENT_CREATE_EVENT = [GO.constant("calendar", "EVENT_CREATE_EVENT"), CUSTOM_EVENT_NS].join("."), 
            EVENT_CHANGED_DATE = ["changed:date", CUSTOM_EVENT_NS].join("."), 
            EVENT_CHANGED_TIME = ["changed:time", CUSTOM_EVENT_NS].join("."), 
            EVENT_CHANGED_VIEW = ["changed:view-type", CUSTOM_EVENT_NS].join("."), 
            
            // 간편등록 일정명 최대길이값
            SUMMARY_MAX_LENGTH = 500;
        
        var __super__ = CalendarView.prototype;

        var CalbeanView = CalendarView.extend({
            name: "Calendar.CalbeanView",
            type: "calbean", 
            height: 0, 

            /**
            초기화 함수

            @method initialize
            */
            initialize: function(options) {
            	this.options = options || {};
                __super__.initialize.call(this);
                
                this.__initRendered__ = false;
                this.options = _.extend({
                    "date": new Date(), "startday": 0, "type": "monthly", 
                    lang: GO.config('locale'), 
                    i18n: {
                        "종일일정": calLang["종일일정"], 
                        "시간": calLang["시간"], 
                        "닫기": commonLang["닫기"],
                        // TODO
                        "개": "", 
                        "전사일정": calLang["전사일정"],
                        "종일근태일정": calLang["종일근태일정"],
                        "등록할 수 없는 일정 경고": calLang["등록할 수 없는 일정 경고"]
                    },
                    collection: this.eventsPool,
                    useAttendeeFetch: true
                }, _.pick(this.options, 'date', 'startday', 'type'), {"lazy": true});
                
                this.calbean = this.$el.calbean(this.options);
            }, 

            /**
            render

            @method render
            */
            render: function(calId, opts) {
                this
                	._getCalendarEvents()
                	.done($.proxy(function(pool) {
	                    var tevents = pool.merge();
	                    if(calId) {
	                        tevents = _.filter(tevents, {calendarId: +calId}); 
	                    }
	                    this.calbean.render(tevents, opts);
	                }, this))
	                .fail($.proxy(function() {
	                	this.calbean.render([], opts);
	                }, this));
                
                this.__initRendered__ = true;
                return this;
            }, 
            
            /**
            Event Delegate

            @method delegateEvents
            @param {Array} events 이벤트 배열(Optional)
            */
            delegateEvents: function(events) {                
                __super__.delegateEvents.call(this, events);

                this.undelegateEvents();
                this._delegateCustomEvents();
                this._delegateCalbeanEvents();
            }, 

            /**
            Event Undelegate

            @method undelegateEvents
            */
            undelegateEvents: function() {
                __super__.undelegateEvents.call(this);

                $(document).off('.' + CUSTOM_EVENT_NS);
                this.calbean.off('.' + CUSTOM_EVENT_NS);
            }, 

            /**
            달력 높이 재지정

            @method resize
            @param {integer} height 캘린더 높이(px)
            */
            resize: function(height) {
                this.calbean.resize(height);
                return this;
            }, 

            /**
            일자 변경

            @method changeDate
            */
            changeDate: function(date) {
                var self = this;
                this.options.date = GO.util.toMoment(date).toDate();
                this._getCalendarEvents().done(function(pool) {
                    self.calbean.changeDate(self.options.date, pool.merge());
                });
            }, 

            /**
            뷰 타입 변경(Override)

            @method changeType
            */
            changeType: function(type) {
                this.calbean.changeViewType(type);
            }, 

            /**
            show:calendar 이벤트 콜백 함수

            @method _showCalendar
            @param {Array} calendars 캘린더 정보 배열
            @private
            */
            _showCalendar: function(e, calendars) { 
                var self = this; 
                this.showCalendar(calendars)
                    .done(function() {
                        // 이벤트 요청(to server) & 캐싱 처리
                        self._getCalendarEvents().done(function(pool) {
                            self.calbean.resetEvents(pool.merge());
                        });
                    });
            },

            /**
            hide:calendar 이벤트 콜백 함수

            @method _hideCalendar
            @param {Array} calendars 캘린더 정보 배열
            @private
            */
            _hideCalendar: function(e, calendars) {
                var self = this; 
                this.hideCalendar(calendars)
                    .progress(function() {
                        self.calbean.resetEvents(self.eventsPool.merge());
                    });
            }, 

            /**
            remove calendar selected from org slide 조직도에서 선택한 사용자의 일정을 보다가 사이드 캘린더를 선택한 경우의 선처리.
            
            @method _removeOrgSlideSelectedCalendar
            @private
             */
            _removeOrgSlideSelectedCalendar: function() {
                // CalendarView로 이동
                this.beforeSideSelect();
            },
            
            /**
            changed:calendar-color 이벤트 콜백 함수

            @method _changeCalendarColor
            @param {integer} calendarId 캘린더 ID
            @param {String} code 컬러 코드(1 ~ 18)
            @private
            */
            _changeCalendarColor: function(e, calendarId, code) {
                this.calbean.updateCalendarColor(calendarId, code);
                // 이벤트 풀에도 반영
                this.eventsPool.updateCalendar(calendarId, 'color', code, {silent: true});
            }, 

            /**
            CalbeanView가 허용하는 VIEW 타입인지 여부 반환

            @method _isAllowedViewType
            @param {Boolean} 허용 뷰 타입 여부
            @private
            */
            _isAllowedViewType: function(type) {
                return _.contains(['daily', 'weekly', 'monthly'], type);
            }, 

            /**
            조회 시작 시간 반환

            @method _getStartDate
            @private
            */
            _getStartDate: function(relativeMonth) {
            	var basedate = GO.util.toMoment(this.options.date);
            	basedate = relativeMonth ? basedate.add("months", relativeMonth) : basedate; 
                var startDt = basedate.clone().startOf('months'); 
                var offset = startDt.day() - this.options.startday;
                
                return startDt.subtract('days', (offset < 0 ? 7 + offset : offset));
            }, 

            /**
            조회 종료 시간 반환

            @method _getStartDate
            @private
            */
            _getEndDate: function(relativeMonth) {
                var basedate = GO.util.toMoment(this.options.date); 
                basedate = relativeMonth ? basedate.add("months", relativeMonth) : basedate; 
                var endDt = basedate.clone().endOf('months');
                var offset = endDt.day() - this.options.startday;
                
                return endDt.add('days', 7 - (offset < 0 ? 7 + offset : offset) - 1);
            },
            
            /**
             * 조회 앞뒤 1달의 시작/종료 시간 반환
             */
            _getBoundaryDate: function() {
            	return {
            		beforeStartDate: this._getStartDate(-1),
            		beforeEndDate: this._getEndDate(-1),
            		afterStartDate: this._getStartDate(1),
            		afterEndDate: this._getEndDate(1),
            	};
            },

            /**
            캘린더 이벤트 패치
                - CalendarView.getCalendarEvents를 이용
                
            @method _getCalendarEvents
            @param {Boolean} force (Option) 강제 패치 여부
            @return {Array} 이벤트 배열
            @private
            */
            _getCalendarEvents: function() {
                var startDt = this._getStartDate(), 
                    endDt = this._getEndDate();
                
                return this.getCalendarEvents(startDt, endDt, !this.__initRendered__);
            }, 
            
            _setCalendarInfo: function( calendarId ) {
            	var checkedCals = CalUtil.getSavedSelectedCalendar(),
        		newCalendarIds = [];
	        	if (checkedCals) {
	        		newCalendarIds = checkedCals.split(',');
	        		newCalendarIds.push(calendarId.toString());
	        	}
        	
        		CalUtil.saveCheckedCalendar(newCalendarIds);
            },
            
            _goToCalendar: function() {
            	CalUtil.goToCalendar();
            },
            
            /**
            커스텀 이벤트 바인딩

            @method _delegateCustomEvents
            @private
            */
            _delegateCustomEvents: function() {
                $(document).on(EVENT_SHOW_CAL, $.proxy(this._showCalendar, this));
                $(document).on(EVENT_HIDE_CAL, $.proxy(this._hideCalendar, this));
                $(document).on(EVENT_CHANGED_COLOR, $.proxy(this._changeCalendarColor, this));
            }, 
            
            /**
            calbean 객체 이벤트 바인딩

            @method _delegateCalbeanEvents
            @private
            */
            _delegateCalbeanEvents: function() {
                
                this.calbean.on(EVENT_SHOW_EVENT, $.proxy(function(e, calendarId, eventId) {
                    var self = this, 
                        userId = GO.session("id"), 
                        tevent = self.eventsPool.findEvent(calendarId, eventId);

                    //if(tevent.isPrivate() && !tevent.isIncludedAttendee(userId)) {
                    //    ;
                    //} else {
                        GO.router.navigate(["calendar", calendarId, "event", eventId].join("/"), { trigger: true, pushState: true });
                    //}
                }, this));

                this.calbean.on(EVENT_CREATE_EVENT, $.proxy(function(e, timeType, startDate, startTime, endDate, endTime) {
                    var self = this;

                    GOCalendar.addSimpleEvent({
                    	"contextRoot": GO.config('contextRoot'), 
                    	"session": GO.session(),
                        "timeType": timeType,
                        "startDate": startDate, 
                        "startTime": startTime,
                        "endDate": endDate, 
                        "endTime": endTime,
                        "modal": true,
                        "afterAddEvent": function(respData) {
                            var pool = self.eventsPool, 
                            	model = new CalendarEvent(respData);
                            
                            // 다른 사람의 캘린더를 보고 있는 상태에서 일정을 등록할 경우에는 풀에 없으므로 조건검사 필요함
                            if(pool.contains(model.get('calendarId'))) {
                            	// GO-11512 이슈 대응
                            	// 간편등록은 내 일정을 등록하기 때문에 auth 권한은 무조건 true로 설정한다.
                            	model.set('auth', true);
                                pool.addEvent(model);
                                self.calbean.resetEvents(pool.merge());
                            }
                            
                            // 간편일정 등록 후 캘린더 정보 갱신 및 캘린더 이동
                            self._setCalendarInfo(model.get('calendarId'));
                            self._goToCalendar();
                        }, 
                        "onCreateError": function(errorTag) {
                        	$.goMessage(getSimpleEventErrorMessage(errorTag));
                        }, 
                        "lang": {
                        	"내 캘린더": calLang["내 캘린더"], 
                        	"일정 등록": calLang["일정 등록"], 
                			"일정명": calLang["일정명"], 
                			"일시": calLang["일시"], 
                			"시간": calLang["시간"], 
                			"종일": calLang["종일"],
                			"확인": commonLang["확인"], 
                			"취소": commonLang["취소"],
                			"일정상세 입력": calLang["일정상세 입력"], 
                			"기본 캘린더 이름": calLang["캘린더 기본이름"], 
                			"기본 캘린더 표시": calLang["기본 캘린더 표시"],
                			"분" : calLang["분"],
                			"장소" : calLang["장소"],
                			"전사일정" : calLang["전사일정"],
                			"알림메일 확인" : calLang["알림메일 확인"],
                			"일정등록에 대한 알림메일을 보내시겠습니까?" : calLang["일정등록에 대한 알림메일을 보내시겠습니까?"],
                			"보내기" : commonLang["보내기"],
                			"보내지 않음" : calLang["보내지 않음"]
                        }
                    });

                }, this));
                
                this.calbean.on(EVENT_CHANGED_DATE, $.proxy(function(e, eventId, calendarId, updatedDate, draggable, event) {
                    var self = this, 
                        tevent = self.eventsPool.findEvent(calendarId, eventId),
                        orgStartDt = GO.util.toMoment(tevent.get("startTime")),
                        newStartDt = GO.util.toMoment(updatedDate + orgStartDt.format("THH:mm:ssZZ")), 
                        diffStartDt = newStartDt.diff(orgStartDt, 'days'), 
                        orgEndDt = GO.util.toMoment(tevent.get("endTime")), 
                        newEndDt = orgEndDt.clone().add('days', diffStartDt),
                        changedAttrs = {
                            startTime: GO.util.toISO8601(newStartDt),
                            endTime: GO.util.toISO8601(newEndDt)
                        };

                    var eventData = self.$('.ev-' + eventId).data('event');
                    if(eventData){
                        var attendees = eventData.attendees;
                        tevent.set("attendees" , attendees);
                    }
                    
                    var isAvailableAsset = GO.isAvailableApp("asset");

                    //예약 메뉴권한 여부 체크
                    if(isAvailableAsset) {
                        cancelReservedAsset(eventId).then(function confirm() {
                            updateEvent(tevent,changedAttrs,self);
                        });
                    }else {
                        updateEvent(tevent,changedAttrs,self);
                    }
                    
                }, this));
                
                this.calbean.on(EVENT_CHANGED_TIME, $.proxy(function(e, eventId, calendarId, startTime, endTime, scrollTo) {
                    var self = this, 
                        tevent = this.eventsPool.findEvent(calendarId, eventId),
                        changedAttrs = {
                            startTime: startTime,
                            endTime: endTime
                        };

                    var eventIdData = self.$('[data-id="'+eventId+'"]').data();
                    var promise = null;
                    if(eventIdData){
                        promise = eventIdData.promise;
                        if(promise){
                            promise.then(function(){
                                tevent.set('attendees', eventIdData.event ? eventIdData.event.attendees : undefined);
                                var isAvailableAsset = GO.isAvailableApp("asset");

                                //예약 메뉴권한 여부 체크
                                if(isAvailableAsset) {
                                    cancelReservedAsset(eventId).then(function confirm() {
                                        updateEvent(tevent,changedAttrs,self);
                                    });
                                }else {
                                    updateEvent(tevent,changedAttrs,self);
                                }
                            });
                        }
                    }
                }, this));
                
                this.calbean.on(EVENT_CHANGED_VIEW, $.proxy(function(e, viewType, date) {
                    GO.router.navigate(['calendar', viewType, date].join('/'), {trigger: true, pushState: true});
                    e.stopImmediatePropagation();
                }, this));
                
                function confirmNoti(tevent) {
                    var deferred = $.Deferred();

                    $.goPopup({
                        title : calLang["알림메일 확인"],
                        message : calLang["일정수정에 대한 알림메일을 보내시겠습니까?"],
                        buttons : [{
                            btext : commonLang["보내기"],
                            btype : "confirm",
                            callback : function() {
                                tevent.set("mailNoti", true);
                                deferred.resolve();
                            }
                        }, {
                            btext : calLang["보내지 않음"],
                            btype : "normal",
                            callback : function() {
                                tevent.set("mailNoti", false);
                                deferred.resolve();
                            }
                        }],
                        closeIconVisible: false,
                        closeCallback : function() {
                            self.submitFlag = false;
                            deferred.reject();
                        }
                    });

                    return deferred;
                };
                
                function updateEvent(tevent,changedAttrs,self) {
                    var deferred = $.Deferred();
                    // 반복일정일 경우 이 일정만 변경으로 전송
                    if (tevent.isRecurrence()) {
                        tevent.setRecurChangeType('instance');
                    }

                    if (!tevent.isAlone()) {
                        confirmNoti(tevent).done(function () {
                            deferred.resolve();
                        }).fail(function () {
                        });
                    } else {
                        deferred.resolve();
                    }

                    deferred.done(function () {
                        tevent.isMove = true;
                        tevent.save(changedAttrs, {
                            success: function (model) {
                                // 반복 일정이 단일 일정으로 바뀌는 경우를 위해 recurrence 제거
                                changedAttrs.recurrence = '';
                                // GO-11555 : "두사람 이상의 일정을 D&D로 수정시 바로 적용안되는 버그" 이슈 대응
                                self.eventsPool.updateEvents(model.id, changedAttrs);
                                self.calbean.resetEvents(self.eventsPool.merge());
                            },
                            error: function(model, e){
                                self.calbean.render();
                                var result = JSON.parse(e.responseText);
                                $.goMessage(result.message);
                            }
                        });
                    });
                };
            }
        });
        
        function getSimpleEventErrorMessage(errorTag) {
        	var messages = {
    			"required:summary": calLang["일정명을 입력하세요"], 
    			"max:summary": GO.i18n(calLang["일정명은 {{max}}자 이하로 입력해 주십시오"], "max", SUMMARY_MAX_LENGTH)
    		};
     
        	return messages[errorTag] || calLang["일정 등록시 오류가 발생하였습니다"];
        }

        function cancelReservedAsset(eventId) {
            var defer = $.Deferred();

            checkAsset(eventId).done(function(dataSet) {
                if(dataSet.hasAsset) {
                    $.goConfirm(calLang["일정 변경시 자산 예약 취소 메시지"], "", function() {
                        $.ajax({
                            url: GO.config("contextRoot") + 'api/asset/item/reservation',
                            contentType: 'application/json',
                            dataType: "json",
                            data: JSON.stringify({ ids: dataSet.reservedId }),
                            type: "DELETE",
                            success: defer.resolve
                        });
                    }, defer.reject, "");
                } else {
                    defer.resolve();
                }
            });
            
            return defer;
        }

        function checkAsset(eventId) {
            var defer = $.Deferred();
            var dataSet = {
                hasAsset : false
            };

            $.ajax({
                url : GO.contextRoot + "api/asset/my/reservation/calendar/" + eventId,
                success : function(resp) {
                    if (resp.data.length) dataSet.hasAsset = true;
                    dataSet.reservedId = _.map(resp.data, function(asset) {
                        return asset.id;
                    });
                    defer.resolve(dataSet);
                }
            });

            return defer;
        }

        return CalbeanView;
    });

}).call(this);