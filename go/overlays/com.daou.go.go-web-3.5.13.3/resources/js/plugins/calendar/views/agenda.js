(function() {

    define([
        "underscore", 
        "app", 
        "calendar/views/calendar", 
        "hgn!calendar/templates/agenda", 
        "hgn!calendar/templates/agenda_list", 
        "i18n!nls/commons",
        "i18n!calendar/nls/calendar"
    ], 

    function(
        _, 
        GO, 
        CalendarView, 
        AgendaTpl, 
        AgendaListTpl, 
        commonLang, 
        calLang
    ) {
        var CUSTOM_EVENT_NS = 'agendaview', 
            EVENT_SHOW_CAL = [GO.constant("calendar", "EVENT_SHOW_CAL"), CUSTOM_EVENT_NS].join("."), 
            EVENT_HIDE_CAL = [GO.constant("calendar", "EVENT_HIDE_CAL"), CUSTOM_EVENT_NS].join("."), 
            EVENT_CHANGED_COLOR = [GO.constant("calendar", "EVENT_CHANGED_COLOR"), CUSTOM_EVENT_NS].join(".");

        var toMoment = GO.util.toMoment,
            __super__ = CalendarView.prototype,
            tvars = {
                "empty?": false,
                "label": {
                    "date": calLang["날짜"],
                    "period": calLang["기간"],
                    "title": commonLang["제목"],
                    "attendees": calLang["참석자"],
                    "private": commonLang["비공개"],
                    "more": GO.i18n(calLang["일정목록 더보기 라벨"], {"duration": 15})
                },
                "message": {
                    "empty": calLang["일정이 없습니다"]
                }
            };

        var AgendaView = CalendarView.extend({
            name: "Calendar.AgendaView",
            type: "agenda",

            __haveEvents__: false,
            startDate: null,
            endDate: null,

            events: {
                "click #more-load-btn": "_loadMoreList"
            },

            /**
            초기화 함수

            @method initialize
            */
            initialize: function(options) {
            	this.options = options || {};
                console.log("[AgendaView#initialize] called...");
                __super__.initialize.call(this);

                // 캘린더 ID가 지정되면 저장한다.
                this.calendarId = null;

                this.options = _.extend({"date": toMoment(new Date()).startOf('day')}, _.pick(this.options, 'date'));
                this.$el.css('padding-bottom', '20px');
                this._prepareTemplate();

                this._init();
            },

            _init: function() {
            	this.__haveEvents__ = false;
                this.__infinitScrollCount__ = 0;
                this.startDate = null;
                this.endDate = null;
                this.setBoundaryTime();
            },

            setBoundaryTime: function() {
            	if(this.startDate === null) {
                    this.startDate = toMoment(this.options.date).clone().startOf('day');
                }
                this.endDate = this.startDate.clone().add("days", 15).endOf('days');
            },

            /**
            render

            @method render
            */
            render: function(calId) {
                if(calId) {
                    this.calendarId = calId;
                }

                this._renderList();

                return this;
            },

            /**
            Event Delegate

            @method delegateEvents
            @param {Array} events 이벤트 배열(Optional)
            */
            delegateEvents: function(events) {
                console.log("[AgendaView#delegateEvents] called...");
                __super__.delegateEvents.call(this, events);
                $(document).on(EVENT_SHOW_CAL, $.proxy(this._showCalendar, this));
                $(document).on(EVENT_HIDE_CAL, $.proxy(this._hideCalendar, this));
                $(document).on(EVENT_CHANGED_COLOR, $.proxy(this._changeCalendarColor, this));
            },

            /**
            Event Undelegate

            @method undelegateEvents
            */
            undelegateEvents: function() {
                console.log("[AgendaView#undelegateEvents] called...");

                var eventNS = '.' + CUSTOM_EVENT_NS;

                __super__.undelegateEvents.call(this);
                $(document).off(eventNS);
                $(window).off(eventNS);
            },

            /**
            일자 변경

            @method changeDate
            */
            changeDate: function(date) {
                this.options.date = toMoment(date).toDate();
                this._init();

                this.$el.find("tbody").empty();
                this._renderList();
            },

            /**
            일정 목록을 엘리먼트 생성

            @method _renderList
            @private
            @chainable
            */
            _renderList: function(isMoreLoad) {
                isMoreLoad = isMoreLoad || false;

                var self = this,
                    calId = this.calendarId,
                    startDate = isMoreLoad ? this.startDate : this.options.date;

                this.getCalendarEvent(startDate, this.endDate, true).done(function(pool) {
                    var tevents = pool.merge(),
                        slots, lists = [];

                    if(calId) {
                        // calendarId는 문자열이어야 _.where() 함수에서 필터링 된다.
                        tevents = _.where(tevents, {calendarId: calId + ""});
                    }

                    slots = self._buildEventSlots(pool.timeMin, pool.timeMax, tevents);

                    if(slots.length > 0) {
                        _.each(slots, function(slot, i) {
                            lists.push(AgendaListTpl(slot));
                        });
                        self.__haveEvents__ = true;
                    } else {
                        if(!self.__haveEvents__) {
                            lists.push(AgendaListTpl(_.extend(tvars, {"empty?": true})));
                        }
                    }

                    self.$el.find("tbody").append(lists.join("\n"));

                    if(self.__haveEvents__) {
                        $(".bottom_action").show();
                        $(".agenda-duration-wrap").show();
                    } else {
                        $(".bottom_action").hide();
                        $(".agenda-duration-wrap").hide();
                    }

                    self._renderDuration();
                });

                return this;
            },

            _loadMoreList: function() {
                // startDate를 다시 설정한다.
                this.startDate = this.endDate.clone().startOf('day').add('days', 1);
                this.setBoundaryTime();

                this._renderList(true);
            },

            _renderDuration: function() {
            	$('#agenda-duration')
                	.empty()
                    .text( GO.i18n(calLang["일정목록 종료일 표시"], { "date": toMoment(this.endDate).format('YYYY-MM-DD') }) );
            },

            _resetList: function() {
                this.$el.find("tbody").empty();
                this._renderList();
                return this;
            },

            /**
            show:calendar 이벤트 콜백 함수

            @method _showCalendar
            @param {Array} calendars 캘린더 정보 배열
            @private
            */
            _showCalendar: function(e, calendars) {
                console.log("[AgendaView#_showCalendar] loading...");
                var self = this;
                this.showCalendar( calendars )
                    .progress(function() {
                        self._resetList();
                    });
            },

            /**
            hide:calendar 이벤트 콜백 함수

            @method _hideCalendar
            @param {Array} calendars 캘린더 정보 배열
            @private
            */
            _hideCalendar: function(e, calendars) {
                console.log("[AgendaView#_hideCalendar] loading...");
                var self = this;
                this.hideCalendar( calendars )
                    .progress(function() {
                        self._resetList();
                    });
            },

            /**
            changed:calendar-color 이벤트 콜백 함수

            @method _changeCalendarColor
            @param {integer} calendarId 캘린더 ID
            @param {String} code 컬러 코드(1 ~ 18)
            @private
            */
            _changeCalendarColor: function(e, calendarId, code) {
                this.eventsPool.updateCalendar(calendarId, 'color', code, {silent: true});
                this._resetList();
            },

            /**
            일정 목록을 dateslot으로 변경

            @method _buildDateslots
            @return {integer} AgendaEvents 객체
            @private
            */
            _buildEventSlots: function(startDate, endDate, data) {
            	//GO-15489
                var _data = _.filter(data, function(item){
                	return item.summary && item.summary.length > 0;
                }),
                    _slotSize = 15,
                    _sDt = toMoment(startDate).clone(),
                    _eDt = toMoment(endDate).clone(),
                    _tempslots = new Array(_slotSize),
                    _events = [];

                for(var _i=0, len=_data.length; _i<len; _i++) {

                    if(!_data[_i]) continue;

                    var originStartTime;
                    var endStartTime;

                    //일정의 timeType을 확인후 timeZone처리한 데이터로 변환
                    if(_data[_i].timeType == "allday") {
                        originStartTime = GO.util.dateWithoutTimeZone(_data[_i].startTime);
                        endStartTime = GO.util.dateWithoutTimeZone(_data[_i].endTime);
                    } else {
                        originStartTime = _data[_i].startTime;
                        endStartTime = _data[_i].endTime;
                    }

                    var cdata = _data[_i],
                        sTimestamp = Math.max(toMoment(originStartTime).valueOf(), _sDt.valueOf()),
                        eTimestamp = Math.min(toMoment(endStartTime).valueOf(), _eDt.valueOf()),
                        startTime = toMoment(sTimestamp),
                        endTime = toMoment(eTimestamp),
                        curTime = startTime.clone(),
                        // 몇번째 슬롯에서 시작하는가?
                        startSlot = this._getDuration(_sDt, startTime) - 1,
                        // 몇일간의 일정인가?
                        duration = this._getDuration(startTime, endTime);

                    for(var _j = 0; _j < duration; _j++) {
                        var _index = startSlot + _j;
                        if(_index >= 0) {
                            if(!(_tempslots[_index] instanceof Array)) { _tempslots[_index] = []; }
                            var detailUrl = GO.config("root") + ["calendar", cdata.calendarId, "event", cdata.id].join("/"),
                                isShowColor = true,
                                creatorName = "",
                                creatorPosition = "";

                            if (cdata.creator) {
                                creatorName = cdata.creator.name;
                                creatorPosition = cdata.creator.position;
                            }

                            if(cdata.__merged__ && !cdata.__merged__.include_me) {
                                isShowColor = false;
                            }

                            _tempslots[_index].push({
                                "type": cdata.type,
                                "timeType": cdata.timeType,
                                "startTime": cdata.startTime,
                                "endTime": cdata.endTime,
                                "createdAt": cdata.createdAt,
                                "detail_url": detailUrl,
                                "format_date": curTime.format("MM.DD(ddd)"),
                                "format_time": this._getFormattedTime(curTime, cdata),
                                "duration": duration,
                                "calendar_color": cdata.color,
                                "calendar_name": [creatorName, creatorPosition].join(" "),
                                "summary": cdata.summary,
                                "attendees": this._getAttendeedsString(cdata.attendees),
                                "show_color?": isShowColor,
                                "is_private?": (cdata.visibility === "private"),
                                "is_group_event?": !!(cdata.__merged__ && cdata.__merged__.calendarId),
                                "first_row?": /*(_index === startSlot)*/false,
                                "rowspan?": /*(duration > 1)*/false,
                                "is_ehr_event": isEhrEvent(cdata),
                                "creator_name": creatorName,

                                // (deprecated) 다음은 확인 후 삭제
                                "event_id": cdata.id,
                                "calendar_id": cdata.calendarId,
                            });
                        }

                        curTime.add('days', 1);
                    }
                }

                _.each(_tempslots, function(slotevents, index){
                    if(slotevents) {
                        if(_events[index]) {
                            _events[index].concat(slotevents);
                        } else {
                            _events[index] = slotevents;
                        }

                        _events[index].sort(sortEventsCampareTo);

                        _.extend(_events[index][0], {
                            "first_row?": true,
                            "rowspan?": _events[index].length > 1 ? true: false,
                            "rowspan_count": _events[index].length
                        });
                    }
                });

                return _.flatten(_.compact(_events), true);
            },

            /**
            형식화된 기간 문자열 반환

            @method _getFormattedTime
            @return {String} 형식화된 기간 문자열
            @private
            */
            _getFormattedTime: function(slotdate, eventData) {
                var formatTime = '',
                    fromDt, toDt,
                    duration = this._getDuration(eventData.startTime, eventData.endTime),
                    formatStart = toMoment(eventData.startTime).format("A hh:mm"),
                    formatEnd = toMoment(eventData.endTime).format("A hh:mm");

                if(eventData.timeType === 'allday') {
                    formatTime = (isEhrEvent(eventData) ? calLang["근태일정"]: calLang['종일일정']);
                } else {
                    if(duration > 1) {
                        fromDt = GO.util.isSameDate(slotdate, eventData.startTime) ? formatStart : calLang["계속"];
                        toDt = GO.util.isSameDate(slotdate, eventData.endTime) ? formatEnd : calLang["계속"];
                    } else {
                        fromDt = formatStart;
                        toDt = formatEnd;
                    }

                    formatTime = [fromDt, toDt].join(" ~ ");
                }

                return formatTime;
            },

            /**
            두 날짜간의 기간 계산

            @method _getDuration
            @param {Date or String} start 시작 시간
            @param {Date or String} end 종료 시간
            @return {integer} 기간
            @private
            */
            _getDuration: function(start, end) {
                return Math.ceil(toMoment(end).clone().endOf('days').diff(toMoment(start).clone().startOf('days'), 'days', true));
            },

            /**
            참석자 목록 문자열 생성

            @method _getAttendeedsString
            @return {String} 참석자 목록 문자열
            @private
            */
            _getAttendeedsString: function(attendees) {
                var buffer = _.map(attendees, function(attendee) {
                    if (attendee.name) {
                        return [attendee.name, attendee.position].join(" ");
                    }
                    return attendee.email;
                });
                return buffer.join(", ");
            },

            /**
            Event Undelegate

            @method _prepareTemplate
            */
            _prepareTemplate: function() {
                this.$el.empty().html(AgendaTpl(tvars));
            }
        });

        function isEhrEvent(evt) {
            return evt.referenceId ? true : false;
        }

        function sortEventsCampareTo(a, b) {
        	var typeI = { 'holiday': 1, 'anniversary': 1, 'company': 2, 'normal': 2 };
            var timeTypeI = { 'allday': 1, 'timed': 2 };
    		/**
             * 이벤트 정렬
             * 
             * [ 정렬 알고리즘 ]
             * 1. 휴일이나 기념일 먼저
             * 2. 시간 일정이 아닌 경우 종일/근태일정 중 종일일정 먼저
             * 3. 시작일자가 빠른 순
             * 4. 종료일자가 느린 순
             * 5. 종일일정이 먼저
             * 6. 시작일자 + 시간 빠른 순(시간일정 때문에 필요)
             * 7. 등록일이 먼저
             * 8. 그외에는 정렬 안함
             */
            return new SortPipe(a, b)
            	.pipe(function diffType(a, b) {
            		return typeI[a.type] - typeI[b.type];
            	})
                .pipe(function diffEhrEvent(a, b) {
                    if(a.timeType == 'allday' && b.timeType == 'allday') {
                        if(a.is_ehr_event && !b.is_ehr_event) {
                            return 1;
                        } else if(!a.is_ehr_event && b.is_ehr_event) {
                            return -1;
                        }
                    }
                    return 0;
                })
            	.pipe(function diffStartDate(a, b) {
            		return compareDateString(a.startTime, b.startTime);
            	})
            	.pipe(function diffEndDate(a, b) {
            		return compareDateString(b.endTime, a.endTime);
            	})
            	.pipe(function diffTimeType(a, b) {
            		return timeTypeI[a.timeType] - timeTypeI[b.timeType];
            	})
            	.pipe(function diffStartTime(a, b) {
            		return GO.util.toMoment(a.startTime).valueOf() - GO.util.toMoment(b.startTime).valueOf();
            	})
            	.pipe(function diffCreateDate(a, b) {
            		return GO.util.toMoment(a.createdAt).valueOf() - GO.util.toMoment(b.createdAt).valueOf();
            	})
            	.run();
            
            function compareDateString(a, b) {
            	var aSdt = a.split('T')[0];
        		var bSdt = b.split('T')[0];
        		var result = -1;
        		
        		if(aSdt > bSdt) {
        			result = 1;
        		} else if(aSdt === bSdt) {
        			result = 0;
        		}
        		
        		return result;
            }
            
            function SortPipe(a, b) {
            	this.a = a;
            	this.b = b;
            	
            	this.__result__ = 0;
            	
            	this.pipe = function(compareFunc) {
            		if(this.__result__ === 0) {
            			this.__result__ = compareFunc(this.a, this.b);
            		}
            		return this;
            	};
            	
            	this.run = function() {
            		return this.__result__;
            	}
            }
        }

        return AgendaView;
    });

}).call(this);