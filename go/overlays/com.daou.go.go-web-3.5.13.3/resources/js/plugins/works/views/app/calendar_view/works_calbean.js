(function () {
    "use strict";

    define([
            "when",
            "app",
            "underscore",
            "works/views/app/calendar_view/works_calendar",
            "hgn!works/templates/app/calendar_view/event_layer",

            "i18n!nls/commons",
            "i18n!calendar/nls/calendar",
            "i18n!task/nls/task",
            "jquery.go-popup",
            "jquery.works-calbean"
        ],

        function (
            when,
            GO,
            _,
            CalendarView,
            EventLayerTpl,
            commonLang,
            calLang,
            taskLang
        ) {
            var // 상수 정의
                CUSTOM_EVENT_NS = 'calbeanview',
                // CalbeanView 커스텀 이벤트
                EVENT_SHOW_CAL = [GO.constant("works", "EVENT_SHOW_CAL"), CUSTOM_EVENT_NS].join("."),
                EVENT_HIDE_CAL = [GO.constant("works", "EVENT_HIDE_CAL"), CUSTOM_EVENT_NS].join("."),
                EVENT_CHANGED_COLOR = [GO.constant("works", "EVENT_CHANGED_COLOR"), CUSTOM_EVENT_NS].join("."),

                // calbean 이벤트
                EVENT_SHOW_EVENT = [GO.constant("works", "EVENT_SHOW_EVENT"), CUSTOM_EVENT_NS].join("."),
                EVENT_CREATE_EVENT = [GO.constant("works", "EVENT_CREATE_EVENT"), CUSTOM_EVENT_NS].join("."),
                EVENT_CHANGED_DATE = ["changed:date", CUSTOM_EVENT_NS].join("."),
                EVENT_CHANGED_TIME = ["changed:time", CUSTOM_EVENT_NS].join("."),
                EVENT_CHANGED_VIEW = ["changed:view-type", CUSTOM_EVENT_NS].join(".");

            var __super__ = CalendarView.prototype;

            return CalendarView.extend({ //CalbeanView
                name: "Works.CalbeanView",
                type: "calbean",
                height: 0,
                queryString: "",

                initialize: function (options) {
                    this.options = options || {};
                    __super__.initialize.call(this, this.options);

                    this.__initRendered__ = false;
                    this.options = _.extend({
                        date: new Date(),
                        startday: 0,
                        type: "monthly",
                        lang: GO.config('locale'),
                        i18n: {
                            "종일일정": calLang["종일일정"],
                            "시간": calLang["시간"],
                            "닫기": commonLang["닫기"],
                            "전사일정": calLang["전사일정"]
                        },
                        collection: this.eventsPool,
                    }, _.pick(this.options, 'date', 'startday', 'type'), {"lazy": true});

                    this.calbean = this.$el.calbean(this.options);
                },

                render: function (opts) {
                    this._getCalendarEvents()
                        .done($.proxy(function (pool) {
                            var tevents = pool.merge();
                            this.calbean.render(tevents, opts);
                        }, this))
                        .fail($.proxy(function () {
                            this.calbean.render([], opts);
                        }, this));

                    this.__initRendered__ = true;
                    return this;
                },

                delegateEvents: function (events) {
                    __super__.delegateEvents.call(this, events);

                    this.undelegateEvents();
                    this._delegateCustomEvents();
                    this._delegateCalbeanEvents();
                },

                undelegateEvents: function () {
                    __super__.undelegateEvents.call(this);

                    $(document).off('.' + CUSTOM_EVENT_NS);
                    this.calbean.off('.' + CUSTOM_EVENT_NS);
                },

                setDodAddable: function (isDocAddable) {
                    this.isDocAddable = isDocAddable;
                },

                setFields: function (fields) {
                    this.fields = fields;
                },

                /**
                 달력 높이 재지정

                 @method resize
                 @param {integer} height 캘린더 높이(px)
                 */
                resize: function (height) {
                    this.calbean.resize(height);
                    return this;
                },

                /**
                 일자 변경

                 @method changeDate
                 */
                changeDate: function (date) {
                    var self = this;
                    this.options.date = GO.util.toMoment(date).toDate();
                    this._getCalendarEvents().done(function (pool) {
                        self.calbean.changeDate(self.options.date, pool.merge());
                    });
                },

                /**
                 뷰 타입 변경(Override)

                 @method changeType
                 */
                changeType: function (type) {
                    this.calbean.changeViewType(type);
                },

                /**
                 show:calendar 이벤트 콜백 함수

                 @method _showPeriod
                 @param {Array} calendars 캘린더 정보 배열
                 @private
                 */
                _showPeriod: function (e, periods) {
                    var self = this;
                    this.showPeriod(periods).done(function () {
                        // 이벤트 요청(to server) & 캐싱 처리
                        self._getCalendarEvents().done(function (pool) {
                            self.calbean.resetEvents(pool.merge());
                        });
                    });
                },

                /**
                 hide:calendar 이벤트 콜백 함수

                 @method _hidePeriod
                 @param {Array} periods 캘린더 정보 배열
                 @private
                 */
                _hidePeriod: function (e, periods) {
                    var self = this;
                    this.hidePeriod(periods)
                        .progress(function () {
                            self.calbean.resetEvents(self.eventsPool.merge());
                        });
                },

                /**
                 changed:period-color 이벤트 콜백 함수

                 @method _changePeriodColor
                 @param {integer} periodId
                 @param {String} code 컬러 코드(1 ~ 18)
                 @private
                 */
                _changePeriodColor: function (e, periodId, code) {
                    this.calbean.updatePeriodColor(periodId, code);
                    // 이벤트 풀에도 반영
                    this.eventsPool.updateCalendar(periodId, 'color', code, {silent: true});
                },

                /**
                 조회 시작 시간 반환

                 @method _getStartDate
                 @private
                 */
                _getStartDate: function (relativeMonth) {
                    var basedate = GO.util.toMoment(this.options.date);
                    basedate = relativeMonth ? basedate.add("months", relativeMonth) : basedate;
                    var startDt = basedate.clone().startOf('months');
                    var offset = startDt.day() - this.options.startday;

                    return startDt.subtract('days', (offset < 0 ? 7 + offset : offset));
                },

                /**
                 조회 종료 시간 반환

                 @method _getEndDate
                 @private
                 */
                _getEndDate: function (relativeMonth) {
                    var basedate = GO.util.toMoment(this.options.date);
                    basedate = relativeMonth ? basedate.add("months", relativeMonth) : basedate;
                    var endDt = basedate.clone().endOf('months');
                    var offset = endDt.day() - this.options.startday;
                    return endDt.add('days', 7 - (offset < 0 ? 7 + offset : offset) - 1);
                },

                /**
                 * 조회 앞뒤 1달의 시작/종료 시간 반환
                 */
                _getBoundaryDate: function () {
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
                _getCalendarEvents: function () {
                    var startDt = this._getStartDate();
                    var endDt = this._getEndDate();
                    return this.getCalendarEvents(startDt, endDt, !this.__initRendered__, this.queryString);
                },

                /**
                 커스텀 이벤트 바인딩

                 @method _delegateCustomEvents
                 @private
                 */
                _delegateCustomEvents: function () {
                    $(document).on(EVENT_SHOW_CAL, $.proxy(this._showPeriod, this));
                    $(document).on(EVENT_HIDE_CAL, $.proxy(function (e, periods) {
                        this._hidePeriod(e, periods);
                    }, this));
                    $(document).on(EVENT_CHANGED_COLOR, $.proxy(this._changePeriodColor, this));
                },

                /**
                 calbean 객체 이벤트 바인딩

                 @method _delegateCalbeanEvents
                 @private
                 */
                _delegateCalbeanEvents: function () {
                    this.calbean.on(EVENT_SHOW_EVENT, $.proxy(function (e, periodId, eventId) {
                        var tevent = this.eventsPool.findEvent(periodId, eventId);
                        var event = tevent.toJSON();
                        this.popupEl = $.goPopup({
                            header: " ",
                            pclass: "layer_normal layer_calendar_info",
                            width: 500,
                            title: "",
                            contents: EventLayerTpl({
                                commonLang: commonLang,
                                reverseCautionLang: taskLang['종료일이 시작일보다 이전일 수 없습니다.'],
                                event: event,
                                isReversed: new Date(event.startTime) > new Date(event.endTime),
                                isTimed: event.timeType === 'timed'
                            }),
                            buttons: [
                                {
                                    'btext': commonLang["상세"],
                                    'btype': 'confirm',
                                    'callback': function (rs) {
                                        var url = window.location.protocol + "//"
                                            + window.location.host + GO.contextRoot
                                            + "app/works/applet/" + tevent.get('appletId')
                                            + "/doc/" + tevent.get("docId") + "/popup";
                                        window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
                                    }
                                },
                                {
                                    'btext': commonLang["취소"],
                                    'btype': 'cancel'
                                }
                            ]
                        });
                        this.popupEl.addClass("go_renew");
                        initDatePicker(tevent, this);
                    }, this));

                    this.calbean.on(EVENT_CREATE_EVENT, $.proxy(function (e, appletId) {
                        if (!this.isDocAddable) return;
                        var url = ["works/applet", appletId, "doc/new"];
                        GO.router.navigate(url.join('/'), {trigger: true, pushState: true});
                        e.stopImmediatePropagation();
                    }, this));

                    this.calbean.on(EVENT_CHANGED_DATE, $.proxy(function (e, docId, periodId, updatedDate) {
                        var self = this,
                            tevent = self.eventsPool.findEvent(periodId, periodId + '_' + docId),
                            orgStartDt = GO.util.toMoment(tevent.get("startTime")),
                            newStartDt = GO.util.toMoment(updatedDate + orgStartDt.format("THH:mm:ssZZ")),
                            diffStartDt = newStartDt.diff(orgStartDt, 'days'),
                            orgEndDt = GO.util.toMoment(tevent.get("endTime")),
                            newEndDt = orgEndDt.clone().add('days', diffStartDt),
                            changedAttrs = {
                                startTime: GO.util.toISO8601(newStartDt),
                                endTime: GO.util.toISO8601(newEndDt)
                            };
                        updateEvent(tevent, changedAttrs, self);
                    }, this));

                    this.calbean.on(EVENT_CHANGED_TIME, $.proxy(function (e, eventId, periodId, startTime, endTime) {
                        var self = this,
                            tevent = this.eventsPool.findEvent(periodId, eventId),
                            changedAttrs = {
                                startTime: startTime,
                                endTime: endTime
                            };
                        updateEvent(tevent, changedAttrs, self);
                    }, this));

                    this.calbean.on(EVENT_CHANGED_VIEW, $.proxy(function (e, viewType, date) {
                        GO.router.navigate(['calendar', viewType, date].join('/'), {trigger: true, pushState: true});
                        e.stopImmediatePropagation();
                    }, this));

                    function initDatePicker(tevent, self) {
                        var startDateTime = tevent.get("startTime");
                        if (!_.isUndefined(startDateTime)) {
                            var startDt = GO.util.toMoment(startDateTime);
                            var startDate = startDt.format("YYYY-MM-DD");
                            var startTime = startDt.format("HH:mm");
                            self.popupEl.find('#startDate').val(startDate);
                            self.popupEl.find('#startDate').attr('data-prev', startDate);
                            self.popupEl.find('#startTime').val(startTime);
                        }
                        var endDateTime = tevent.get("endTime");
                        if (!_.isUndefined(endDateTime)) {
                            var endDateTime = tevent.get("endTime");
                            var endDt = GO.util.toMoment(endDateTime);
                            var endDate = endDt.format("YYYY-MM-DD");
                            var endTime = endDt.format("HH:mm");
                            self.popupEl.find('#endDate').val(endDate);
                            self.popupEl.find('#endDate').attr('data-prev', endDate);
                            self.popupEl.find('#endTime').val(endTime);
                        }
                    }

                    function updateEvent(tevent, changedAttrs, self) {
                        var url = [self.contextRoot, 'api/works/applet', self.appletId, "calendarview/event/move?"].join('/')
                            + $.param(_.extend({
                                periodId: tevent.get('periodId'),
                                docId: tevent.get('docId')
                            }, changedAttrs));
                        $.ajax({
                            url: url,
                            type: 'PUT',
                            contentType: 'application/json',
                            dataType: 'json',
                            success: function (resp) {
                                self.eventsPool.updateEvents(resp.data.id, changedAttrs);
                                self.calbean.resetEvents(self.eventsPool.merge());
                            },
                            error: function (resp) {
                                self.calbean.render();
                                $.goError(resp.responseJSON.message);
                            }
                        });
                    }
                }
            });
        });

}).call(this);