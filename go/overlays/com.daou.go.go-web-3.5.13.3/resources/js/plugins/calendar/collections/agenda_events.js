//(function() {
//    define([
//        "underscore", 
//        "app", 
//        "calendar/collections/events", 
//        "i18n!calendar/nls/calendar"
//    ], 
//
//    function(
//        _,
//        GO, 
//        CalendarEvents, 
//        calLang
//    ) {
//        var 
//            AgendaEvents, 
//            toMoment = GO.util.toMoment, 
//            _slice = Array.prototype.slice, 
//            __super__ = CalendarEvents.prototype;
//
//        AgendaEvents = CalendarEvents.extend({
//            /**
//            Agenda 일정 슬롯
//
//            @property __dateslots__ 
//            @type Array
//            @default []
//            **/
//            __dateslots__: [], 
//
//            /**
//            Initializer
//
//            @method initialize
//            **/
//            initialize: function() {
//                __super__.initialize.apply(this, _slice.call(arguments));
//                this.__dateslots__ = [];
//            }, 
//
//            /**
//            Agenda형 일정 패치시 parse 함수(Backbone.Collection#parse 함수의 오버라이드)
//
//            @method parse
//            @return {Object} CalendarDefaultLayout 인스턴스 객체
//            */            
//            parse: function(res) {
//                this._buildDateslots(res.data);
//                return __super__.parse.call(this, res);
//            }, 
//
//            /**
//            일자별 슬롯 전체 반환
//
//            @method parse
//            @return {Object} CalendarDefaultLayout 인스턴스 객체
//            */   
//            getDateslots: function() {
//                return this.__dateslots__;
//            }, 
//
//            /**
//            __dateslots__ 생성
//
//            @method _buildDateslots
//            @return {integer} AgendaEvents 객체
//            @private
//            */ 
//            _buildDateslots: function(data) {
//                var _data = data, 
//                    _slotSize = this._getDuration(this.conditions.startTime, this.conditions.endTime) - 1, 
//                    _mstart = toMoment(this.conditions.startTime).clone(), 
//                    _tempslots = new Array(_slotSize);
//
//                for(var _i in _data) {
//                    var cdata = _data[_i], 
//                        startTime = toMoment(cdata.startTime), 
//                        endTime = toMoment(cdata.endTime), 
//                        curTime = startTime.clone(), 
//                        // 몇번째 슬롯에서 시작하는가?
//                        startSlot = this._getDuration(_mstart, startTime) - 1, 
//                        // 몇일간의 일정인가?
//                        duration = this._getDuration(startTime, endTime);
//
//                    for(var _j = 0; _j < duration; _j++) {
//                        var _index = startSlot + _j;
//                        if(!(_tempslots[_index] instanceof Array)) _tempslots[_index] = [];
//                        _tempslots[_index].push({
//                            "format_date": curTime.format("MM.DD(ddd)"), 
//                            "format_time": this._getFormattedTime(curTime, cdata), 
//                            "duration": duration, 
//                            "calendar_color": cdata.color, 
//                            //>>>> TO-DO: 나 일 경우 처리
//                            "calendar_name": [cdata.creator.name, cdata.creator.position].join(" "), 
//                            "summary": cdata.summary, 
//                            "attendees": this._getAttendeedsString(cdata.attendees), 
//                            "first_row?": /*(_index === startSlot)*/false, 
//                            "rowspan?": /*(duration > 1)*/false
//                        });
//
//                        curTime.add('days', 1);
//                    }
//                }
//
//                this.__dateslots__ = _tempslots;
//
//                return this;
//            }, 
//
//            /**
//            두 날짜간의 기간 계산
//
//            @method _getDuration
//            @return {integer} 기간
//            @private
//            */ 
//            _getDuration: function(start, end) {
//                return Math.ceil(toMoment(end).clone().endOf('days').diff(toMoment(start).clone().startOf('days'), 'days'));
//            }, 
//
//            /**
//            형식화된 기간 문자열 반환
//
//            @method _getFormattedTime
//            @return {String} 형식화된 기간 문자열
//            @private
//            */
//            _getFormattedTime: function(slotdate, eventData) {
//                var sformat = '', eformat = '', 
//                    a = this._getDuration(slotdate, eventData.startTime), 
//                    b = this._getDuration(eventData.end, slotdate), 
//                    d = this._getDuration(eventData.startTime, eventData.endTime), 
//                    formatStart = toMoment(eventData.startTime).format("A hh:mm"), 
//                    formatEnd = toMoment(eventData.endTime).format("A hh:mm");
//
//
//                if(eventData.timeType === 'allday') return calLang["종일일정"];
//                if(d < 2) return [formatStart, formatEnd].join(" ~ ");
//                if(a > 0 && b < 0) return [calLang["계속"], calLang["계속"]].join(" ~ ");
//
//                sformat = a > 0 ? calLang["계속"] : formatStart;
//                eformat = b < 0 ? calLang["계속"] : formatEnd;
//                return [sformat, eformat].join(" ~ ");
//            }, 
//
//            _getAttendeedsString: function(attendees) {
//                var buffer = [];
//                _.each(attendees, function(attendee) {
//                    buffer.push([attendee.name, attendee.position].join(" "));
//                }); 
//                return buffer.join(", ");
//            }
//        }, {
//            __instance__: null, 
//
//            getDateslots: function(calendarIds, startTime, endTime, isAsync) {
//                var _events = [], 
//                    calendarIds = (calendarIds instanceof Array ? calendarIds : [calendarIds]);
//
//                _.each(calendarIds, function(calendarId) {
//                    var collection = this.fetch(calendarId, startTime, endTime, isAsync);
//
//                    _.each(collection.getDateslots(), function(slotevents, index){
//                        if(slotevents) {
//                            if(_events[index]) {
//                                _events[index].concat(slotevents);
//                            } else {
//                                _events[index] = slotevents;
//                            }
//
//                            _.extend(_events[index][0], {
//                                "first_row?": true, 
//                                "rowspan?": _events[index].length > 1 ? true: false, 
//                                "rowspan_count": _events[index].length
//                            });
//                        }
//                    });
//                }, this);
//
//                return _.compact(_events);
//            }
//        });
//
//        return AgendaEvents;
//    })
//}).call(this);