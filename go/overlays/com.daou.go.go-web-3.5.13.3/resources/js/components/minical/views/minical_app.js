define("components/minical/views/minical_app", function (require) {

    var Backbone = require("backbone");
    var App = require("app");
    var Hogan = require("hogan");
    var calendarLang = require("i18n!calendar/nls/calendar");
    var Calendars = require("calendar/collections/calendars");
    var EventPools = require("calendar/collections/events_pool");
    var appTmpl = require("hgn!components/minical/templates/minical_app");
    var UserProfileModel = require("models/user_profile");
    require("GO.util");

    var lang = {
        'today': calendarLang['오늘'],
        'year': calendarLang['년'],
        'month': calendarLang['달'],
        'list': calendarLang['목록'],
        'sun': calendarLang['일'],
        'mon': calendarLang['월'],
        'tue': calendarLang['화'],
        'wed': calendarLang['수'],
        'thu': calendarLang['목'],
        'fri': calendarLang['금'],
        'sat': calendarLang['토'],
        'continue': calendarLang['계속']
    };

    /**
     * 캘린더/예약 모바일 버전에서 사용되는 작은 캘린더 뷰를 표현한다.
     *
     *
     * [제공 기능]
     *
     * - 현재 날짜의 달력 렌더링
     * - 이전/다음달 이동
     * - 오늘 날짜로 이동
     * - 휴일 표현
     * - 외부 데이터 연동 (이전/다음달 지원)
     * - 특정 날짜의 데이터 목록 표현
     * - 이름과 행위 지정 가능한 좌측 상단 제공
     *
     *
     * [제공 UI]
     *
     * - 좌측 상단 버튼(button)
     * - 이전/다음 달 이동 버튼(button)
     * - 오늘 버튼(button)
     * - 캘린더 테이블(table)
     * - 날짜 데이터 리스트(dl)
     *
     */
    var MiniCalendarApp = Backbone.View.extend({

        tagName: 'div',
        id: 'mini_calendar',
        events: {
            'vclick .wrap_updown': "clickArrow"
        },
        /**
         * 앱뷰 초기화
         *
         * @param {Object} options - 초기 데이터
         * @param {jQueryElement} options.renderTarget - 캘린더 뷰를 append 할 대상 엘리먼트
         * @param {Object} options.buttonLeft - 왼쪽에 표현할 버튼
         * @param {string} options.buttonLeft.label - 왼쪽에 표현할 버튼 이름
         * @param {function} options.buttonLeft.url - 왼쪽에 표현된 버튼 클릭시 이동할 URL 반환 함수
         * @param {string} options.dateDataEmptyMessage - 선택된 날짜에 표현할 데이터가 없는 경우, 표현할 메시지
         * @param {requestCallback} options.loadDataOnDateSet
         *              - 날짜가 설정되면 캘린더를 그리기에 앞서 호출되는 외부 데이터 로딩 콜백
         *              - 데이터 구조는 CalTbView의 initialize를 참조
         * @return
         */
        initialize: function (options) {
            this.renderTarget = options.renderTarget;
            this.renderDate = options.renderDate;
            this.buttonLeft = options.buttonLeft;
            this.dateDataEmptyMessage = options.dateDataEmptyMessage;
            this.dataManager = new DataManager({loadData: options.loadDataOnDateSet});
            this.observer = _.extend({}, Backbone.Events);
            this.holidayManager = new HolidayManager();

            this._setCurrent(MHelper.now());
            this._bindDateSelected();
            this._bindLeftButtonClicked();
            this._bindMonthChanged();
            this._bindDataListExpanded();
        },

        clickArrow: function (e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            var target = $(e.currentTarget);
            this.observer.trigger("DataListArrowClicked", target);
        },

        _setCurrent: function (date) {
            if (!this.renderDate) {
                this.curYear = MHelper.getYear(date);
                this.curMonth = MHelper.getMonth(date);
            } else {
                this.curYear = this.renderDate.split(".")[0];
                this.curMonth = this.renderDate.split(".")[1];
                this.renderDate = "";
            }
        },

        _bindDateSelected: function () {
            this.observer.on('dateSelected', function () {
                var selectedDate = arguments[0];
                var dataListInDate = arguments[1];
                this._onDateSelected(selectedDate, dataListInDate);
            }, this);
        },

        _bindLeftButtonClicked: function () {
            this.observer.on('leftButtonClicked', function () {
                this._onLeftButtonClicked();
            }, this);
        },

        _bindMonthChanged: function () {
            this.observer.on('nextMonthClicked prevMonthClicked todayClicked nextDayClicked prevDayClicked', function (eventName, v) {
                console.log('minical month changed event. ' + eventName);
                var base = MHelper.startOfMonth(this.curYear, this.curMonth);
                var changedDate;
                var fetchTask;
                switch (eventName) {
                    case 'nextMonthClicked':
                        this._setCurrent(MHelper.addMonth(base, 1));
                        fetchTask = this._fetchSideMonth();
                        break;
                    case 'prevMonthClicked':
                        this._setCurrent(MHelper.subtractMonth(base, 1));
                        fetchTask = this._fetchSideMonth();
                        break;
                    case 'nextDayClicked':
                        var dateYYYYMMDD = $("#curMonthPart").text().replace(/\./gi, "-");
                        this.curMonth = $("#curMonthPart").text().split(".")[1];
                        changedDate = moment(dateYYYYMMDD).add(1, 'days');
                        if (changedDate.format("MM") !== this.curMonth || $("#curMonthPart").attr("data-date").split(".")[1] !== this.curMonth) {
                            if ($("#curMonthPart").attr("data-date").split(".")[1] !== this.curMonth) {
                                this.curMonth -= 1;
                            }
                            this.observer.trigger('nextMonthClicked', 'nextMonthClicked');
                            $("#curMonthPart").attr("data-date", changedDate.format("YYYY.MM"));
                        }
                        break;
                    case 'prevDayClicked':
                        var dateYYYYMMDD = $("#curMonthPart").text().replace(/\./gi, "-");
                        this.curMonth = $("#curMonthPart").text().split(".")[1];
                        changedDate = moment(dateYYYYMMDD).subtract(1, 'days');
                        if (changedDate.format("MM") !== this.curMonth || $("#curMonthPart").attr("data-date").split(".")[1] !== this.curMonth) {
                            if ($("#curMonthPart").attr("data-date").split(".")[1] !== this.curMonth) {
                                this.curMonth += 1;
                            }
                            this.observer.trigger('prevMonthClicked', 'prevMonthClicked');
                            $("#curMonthPart").attr("data-date", changedDate.format("YYYY.MM"));
                        }
                        break;
                    default :
                        changedDate = MHelper.now();
                        this._setCurrent(changedDate);
                        this._fetchNowMonth().done($.proxy(this._onFetched, this));
                        $("#curMonthPart").attr("data-date", changedDate.format("YYYY.MM"));

                }

                if (eventName === 'prevDayClicked' || eventName === 'nextDayClicked' || eventName === 'todayClicked') {
                    $("#curMonthPart").text(changedDate.format(this._isCalendarFolded() ? "YYYY.MM.DD" : "YYYY.MM"));
                    this.calTableView._markSelected(changedDate.format("YYYY-MM-DD"));
                } else {
                    $("#curMonthPart").attr("data-date", this.toolbarView._generateTitle(this.curYear, this.curMonth));
                    this.toolbarView.changeTitle(this.curYear, this.curMonth);
                    fetchTask.done($.proxy(this._onFetched, this));
                }

            }, this);
        },

        _isCalendarFolded : function() {
            return $('.wrap_tb_calendar').css('display') === 'none';
        },
        _bindDataListExpanded: function () {
            var self = this;
            this.observer.on('DataListArrowClicked', function (target) {
                if (target.find("span").hasClass("btn_list_up")) {
                    target.find("span").removeClass("btn_list_up").addClass("btn btn_list_down");
                } else {
                    target.find("span").removeClass("btn_list_down").addClass("btn_list_up");
                }

                if (self._isCalendarFolded()) {
                    $("#curMonthPart").text($("#curMonthPart").attr("data-date"));
                    $('.wrap_tb_calendar').css('display', '');
                } else {
                    $("#curMonthPart").attr("data-date", $("#curMonthPart").text().trim());
                    $("#curMonthPart").text(''.concat(self.curYear, ".", $('#minicalendar_datalist dt').text().split(" (")[0].trim()));
                    $('.wrap_tb_calendar').css('display', 'none');
                }


            });
        },
        /**
         * 달력 앱뷰의 현재 선택된 날짜 반환
         * @return {string} getSelectedDate 현재 선택된 날짜의 YYYY-MM-DD 형태 문자열 반환
         */
        getSelectedDate: function () {
            return this.calTableView.getSelectedDate();
        },

        /**
         * 달력 앱뷰 렌더링
         * @return {this} render
         */
        render: function () {
            console.log("render minical");
            this._renderContainer();
            this._renderToolbar();
            this._fetchNowMonth().done($.proxy(this._onFetched, this));
            GO.util.appLoading(true);
            return this;
        },

        _renderContainer: function () {
            this.renderTarget.html(this.$el);
            this.$el.html(appTmpl({
                lang: lang
            }));
        },

        _renderToolbar: function () {
            this.toolbarView = new ToolbarView({
                el: '#minicalendar_toolbar',
                buttonLeft: this.buttonLeft,
                observer: this.observer
            });
            this.toolbarView.render(this.curYear, this.curMonth);
        },

        _onFetched: function (dataList) {
            this.calTableView = new CalTbView({
                holidayManager: this.holidayManager,
                observer: this.observer,
                dataList: dataList,
                year: this.curYear,
                month: this.curMonth
            });
            this.$("#minicalendar_table").replaceWith(this.calTableView.render().el);
        },

        _fetchNowMonth: function () {
            return this.dataManager.fetchMonth(
                this.curYear, this.curMonth);
        },

        _fetchSideMonth: function () {
            return this.dataManager.fetchSideMonth(
                this.curYear, this.curMonth);
        },

        _onDateSelected: function (selectedDate, dataListInDate) {
            var dayDataListView = new DayDataListView({
                date: selectedDate,
                dataList: dataListInDate,
                dateDataEmptyMessage: this.dateDataEmptyMessage
            });

            this.$("#minicalendar_datalist").replaceWith(dayDataListView.render().el);
        },

        _onLeftButtonClicked: function () {
            var url = this.buttonLeft.url({
                'selectedDate': this.calTableView.getSelectedDate()
            });

            if (_.isString(url) && url.length > 0) {
                console.log('minical left button clicked: ' + url);
                App.router.navigate(url, {
                    trigger: true,
                    pushState: true
                });
            }
        }
    });


    /**
     * 좌측 상단 버튼, 이전/다음달 버튼, 오늘 버튼 제공 뷰
     */
    var ToolbarView = Backbone.View.extend({

        events: {
            'vclick #nextMonthPart': '_onNextClicked',
            'vclick #prevMonthPart': '_onPrevClicked',
            'vclick #goToday': '_onGoTodayClicked',
            'vclick #leftButton': '_onLeftButtonClicked'
        },

        initialize: function (options) {
            this.buttonLeft = options.buttonLeft;
            this.observer = options.observer;
        },

        changeTitle: function (year, month) {
            this.$el.find('#curMonthPart').html(this._generateTitle(year, month));
        },

        render: function (year, month) {
            this.$el.html(this._renderTemplate().render(this._makeTemplateData(year, month)));
        },

        _renderTemplate: function () {
            var htmls = [];
            htmls.push('<div class="current_date">');
            htmls.push('     <a data-bypass id="prevMonthPart" href="javascript:;">');
            htmls.push('         <span class="btn btn_prev_type2"></span>');
            htmls.push('    </a>');
            htmls.push('    <span class="date" id="curMonthPart" data-date="{{currentDateBasic}}">');
            htmls.push('        {{yearAndMonth}}');
            htmls.push('    </span>');
            htmls.push('    <a data-bypass id="nextMonthPart" href="javascript:;">');
            htmls.push('        <span class="btn btn_next_type2"></span>');
            htmls.push('    </a>');
            htmls.push('</div>');
            htmls.push('<div class="critical">');
            htmls.push('    <a class="btn_tool" id="leftButton" data-role="button" data-bypass href="javascript:;">');
            htmls.push('        <span class="txt">{{buttonLeftLabel}}</span>');
            htmls.push('    </a>');
            htmls.push('</div>');
            htmls.push('<div class="optional">');
            htmls.push('    <a class="btn_tool" id="goToday" data-role="button" data-bypass href="javascript:;">');
            htmls.push('        <span class="txt">{{lang.today}}</span>');
            htmls.push('    </a>');
            htmls.push('</div>');
            return Hogan.compile(htmls.join(''));
        },

        _makeTemplateData: function (year, month) {
            return {
                'currentDateBasic': [year, month].join('.'),
                'buttonLeftLabel': this.buttonLeft.label,
                'yearAndMonth': this._generateTitle(year, month),
                'lang': lang
            };
        },

        _generateTitle: function (year, month) {
            return ''.concat(year, '.', GO.util.leftPad(month, 2, "0"));
        },

        _onNextClicked: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if ($(".wrap_updown span").hasClass("btn_list_down")) {
                this.observer.trigger('nextDayClicked', 'nextDayClicked');
            } else {
                GO.util.appLoading(false);
                this.observer.trigger('nextMonthClicked', 'nextMonthClicked');
            }
        },

        _onPrevClicked: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if ($(".wrap_updown span").hasClass("btn_list_down")) {
                this.observer.trigger('prevDayClicked', 'prevDayClicked');
            } else {
                GO.util.appLoading(false);
                this.observer.trigger('prevMonthClicked', 'prevMonthClicked');
            }
        },

        _onGoTodayClicked: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.observer.trigger('todayClicked', 'todayClicked');
        },

        _onLeftButtonClicked: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.observer.trigger('leftButtonClicked');
        }
    });

    /**
     * 캘린더 테이블 뷰 (외부 데이터 및 휴일을 함께 표현한다)
     */

    var CalTbView = Backbone.View.extend({

            tagName: "div",
            className: "month_body",
            attributes: {id: "minicalendar_table"},
            events: {
                'vclick td[data-btntype="day"]': '_onDateClicked'
            },


            /**
             * @param {Object[]} options.dataList - loadDataOnDateSet 옵션 함수가 promise를 반환하는 데, 이때의 promise가 resolve될 때의 넘겨 받는 외부 데이터 목록
             * @param {number} options.dataList.id - 외부 데이터 아이디
             * @param {string} options.dataList.name - 외부 데이터 이름
             * @param {moment} options.dataList.startTime- 외부 데이터 시작 시간
             * @param {moment} options.dataList.endTime- 외부 데이터 종료 시간
             * @param {moment} options.dataList.alldayType - 종일 일정 여부
             * @param {string} options.dataList.moveURL - 외부 데이터 클릭시 이동할 페이지
             * @param {boolean} options.dataList.otherCompanyReservation - 타 사이트 예약 여부
             * @return
             */
            initialize: function (options) {
                this.holidayManager = options.holidayManager;
                this.observer = options.observer;
                this.dataList = options.dataList;
                this.year = options.year;
                this.month = options.month;
                this.selectedDate = this._decideSelected(this.year, this.month);
                this.otherCompanyReservation = !!options.otherCompanyReservation;
                if (GO.router.getUrl().indexOf("asset") === -1) {
                    CalTbView.sortEvents(this.dataList);
                }
                this.dataGroupedByDate = CalTbView.groupByDate(this.dataList);
            },

            render: function () {
                this._renderTable();
                this._markSelectedOnInit();
                this._fetchHolidays().done($.proxy(this._markHolidays, this));
                return this;
            },

            getSelectedDate: function () {
                var $selected = this.$el.find('.bg_row td').filter('.on');
                if ($selected.length > 0) {
                    return $selected.attr('data-date');
                }
                return '';
            },

            _decideSelected: function (year, month) {
                var now = MHelper.now();
                if (this.year == MHelper.getYear(now) && this.month == MHelper.getMonth(now)) {
                    return now;
                } else {
                    return MHelper.startOfMonth(year, month);
                }
            },

            _renderTable: function () {
                var template = this._makeTemplate();
                var data = this._makeTemplateData(this.year, this.month);
                this.$el.html(template.render(data));
            },

            _markSelectedOnInit: function () {
                if (!this.$el.find('.bg_row td').hasClass('on')) {
                    this._markSelected(this.selectedDate.format("YYYY-MM-DD"));
                }
            },

            _fetchHolidays: function () {
                var startOfMonth = MHelper.startOfMonth(this.year, this.month);
                var start = CalTbView.getStart(startOfMonth);
                var end = CalTbView.getLast(startOfMonth);
                return this.holidayManager.fetch(start, end);
            },

            _markHolidays: function (holidays) {
                _.each(holidays, function (holiday) {
                    var holidayDate = MHelper.formatInYYYYMMDD(holiday.get('startTime'));
                    var dateTd = this.$el.find('th[data-date="' + holidayDate + '"]');
                    if (!dateTd || dateTd.hasClass('sun')) {
                        return;
                    }

                    if (holiday.get('type') == 'holiday') {
                        dateTd.addClass('sun');
                    }
                }, this);
            },

            _makePieceScheduleTmpl: function (htmls) {
                htmls.push('{{^alreadyRender}}');
                htmls.push('<td class="{{dateClass}} {{#isHoliday}}sun{{/isHoliday}}" colspan="{{period}}">');
                htmls.push('    {{#isAllDayScheduleOfCalenderMenu}}');
                htmls.push('    <div class="schedule_day {{#isHoliday}}holiday_off{{/isHoliday}} bgcolor{{color}}">');
                htmls.push('    {{/isAllDayScheduleOfCalenderMenu}}');
                htmls.push('    {{^isAllDayScheduleOfCalenderMenu}}');
                htmls.push('    <div class="schedule_time">');
                htmls.push('    <span class="chip bgcolor{{color}}"></span>');
                htmls.push('    {{/isAllDayScheduleOfCalenderMenu}}');
                htmls.push('    {{#isSecret}}');
                htmls.push('    <span class="btn btn_secret_s"></span>');
                htmls.push('    {{/isSecret}}');
                htmls.push('        <span>{{name}}</span>');
                htmls.push('    </div>');
                htmls.push('</td>');
                htmls.push('{{/alreadyRender}}');
                return htmls;
            },

            _makeTemplate: function () {
                var htmls = [];
                htmls.push('{{#weeks}}');
                htmls.push('<div class="week_schedule" data-week-id="{{weekId}}">');
                htmls.push('    <table class="tb_calendar schedule_row tb_fix">');
                htmls.push('        <tbody>');
                htmls.push('            <tr>');
                htmls.push('                {{#weekDays}}');
                htmls.push('                <th class="{{dateClass}} {{isWeekend}}" data-date="{{dateInYYYY-MM-DD}}">');
                htmls.push('                    <div>');
                htmls.push('                        <span>{{dateInD}}</span>');
                htmls.push('                    </div>');
                htmls.push('                </th>');
                htmls.push('                {{/weekDays}}');
                htmls.push('            </tr>');
                htmls.push('            <tr>');
                htmls.push('                {{#weekDays}}');
                htmls.push('                {{#firstSchedule}}');
                htmls.push(this._makePieceScheduleTmpl(htmls));
                htmls.push('                {{/firstSchedule}}');
                htmls.push('                {{^firstSchedule}}');
                htmls.push('                <td class="{{dateClass}} {{#isHoliday}}sun{{/isHoliday}}" colspan="{{period}}">');
                htmls.push('                </td>');
                htmls.push('                {{/firstSchedule}}');
                htmls.push('                {{/weekDays}}');
                htmls.push('            </tr>');
                htmls.push('            <tr>');
                htmls.push('                {{#weekDays}}');
                htmls.push('                {{#secondSchedule}}');
                htmls.push(this._makePieceScheduleTmpl(htmls));
                htmls.push('                {{/secondSchedule}}');
                htmls.push('                {{^secondSchedule}}');
                htmls.push('                <td class="{{dateClass}} {{#isHoliday}}sun{{/isHoliday}}" colspan="{{period}}">');
                htmls.push('                </td>');
                htmls.push('                {{/secondSchedule}}');
                htmls.push('                {{/weekDays}}');
                htmls.push('            </tr>');
                htmls.push('            <tr>');
                htmls.push('                {{#weekDays}}');
                htmls.push('                <td class="{{dateClass}}">');
                htmls.push('                    {{#hasScheduleMoreThanTwo}}');
                htmls.push('                    <div class="schedule_more">');
                htmls.push('                        <span>+{{exceededScheduleNum}}</span>');
                htmls.push('                    </div>');
                htmls.push('                    {{/hasScheduleMoreThanTwo}}');
                htmls.push('                </td>');
                htmls.push('                {{/weekDays}}');
                htmls.push('            </tr>');
                htmls.push('        </tbody>');
                htmls.push('    </table>');
                htmls.push('    <table class="bg_row tb_fix">');
                htmls.push('        <tbody>');
                htmls.push('            <tr>');
                htmls.push('                {{#weekDays}}');
                htmls.push('                <td data-date="{{dateInYYYY-MM-DD}}" data-btntype="day"></td>');
                htmls.push('                {{/weekDays}}');
                htmls.push('            </tr>');
                htmls.push('        </tbody>');
                htmls.push('    </table>');
                htmls.push('</div>');
                htmls.push('{{/weeks}}');
                return Hogan.compile(htmls.join(''));
            },

            filterSameSchedule: function (scheduleList, date) {
                var scheduleIdSet = [];
                var scheduleSet = _.filter(scheduleList, function (schedule) {
                    if (scheduleIdSet.indexOf(schedule.id) > -1) {
                        return false;
                    }
                    var alreadyFinishedSchedule = moment(date).isSame(schedule['endTime']) && moment(schedule['endTime']).format("HH:mm") === "00:00" && schedule['timeType'] === "timed";
                    if (!alreadyFinishedSchedule) {
                        scheduleIdSet.push(schedule.id);
                        return true;
                    }
                });
                return scheduleSet;
            },

            _makeTemplateData: function (year, month) {
                var _this = this;
                var startOfMonth = MHelper.startOfMonth(year, month);
                var start = CalTbView.getStart(startOfMonth);
                var end = CalTbView.getLast(startOfMonth);
                var templateData = {
                    'lang': lang,
                    'weeks': []
                };

                var makeDayData = function (date) {
                    var formattedDate = MHelper.formatInYYYYMMDD(date),
                        dateScheduleList = _this.dataGroupedByDate[formattedDate],
                        firstSchedule = false,
                        secondSchedule = false,
                        hasScheduleMoreThanTwo = false;

                    if (!_.isUndefined(dateScheduleList)) {
                        var filteredScheduleList = _this.filterSameSchedule(dateScheduleList, date);
                        var selectedScheduleForRender = selectTwoScheduleForRender(filteredScheduleList, date);
                        hasScheduleMoreThanTwo = filteredScheduleList.length >= 3;
                        if (selectedScheduleForRender.length >= 1) {
                            if (!_.isNull(selectedScheduleForRender[0])) {
                                firstSchedule = makeDayDetailData(selectedScheduleForRender[0], date);
                            }
                            if (!_.isNull(selectedScheduleForRender[1])) {
                                secondSchedule = makeDayDetailData(selectedScheduleForRender[1], date);
                            }
                        }
                    }

                    var isWeekend = function (date) {
                        if (date.day() === 6) {
                            return "sat";
                        } else if (date.day() === 0) {
                            return "sun"
                        } else {
                            return "";
                        }
                    };

                    return {
                        'dateClass': CalTbView.generateTbClass(date, month),
                        'isWeekend': isWeekend(date),
                        'dateInYYYY-MM-DD': formattedDate,
                        'dateInD': date.format('D'),
                        'firstSchedule': firstSchedule,
                        'secondSchedule': secondSchedule,
                        "hasScheduleMoreThanTwo": hasScheduleMoreThanTwo,
                        "exceededScheduleNum": hasScheduleMoreThanTwo ? filteredScheduleList.length - 2 : false
                    };
                };

                var selectTwoScheduleForRender = function (scheduleDataList, date) {
                    var scheduleSet = [],
                        selectedScheduleNum = 0,
                        firstSchedule = null,
                        secondSchedule = null;

                    var setScheduleForRender = function (schedule) {
                        selectedScheduleNum++;
                        schedule.alreadyRender = false;
                        if (_.isNull(firstSchedule)) {
                            schedule.positionForRender = "first";
                            firstSchedule = schedule;
                        } else {
                            schedule.positionForRender = "second";
                            secondSchedule = schedule;
                        }
                    };

                    var setScheduleForNotRender = function (comparisonTarget, schedule) {
                        if (comparisonTarget.positionForRender === "first") {
                            schedule.alreadyRender = true;
                            selectedScheduleNum++;
                            firstSchedule = schedule;
                        } else if (comparisonTarget.positionForRender === "second") {
                            schedule.alreadyRender = true;
                            selectedScheduleNum++;
                            secondSchedule = schedule;
                        }
                    };

                    for (var i = 0; i < scheduleDataList.length; i++) {
                        if (selectedScheduleNum === 2) {
                            break;
                        }

                        var schedule = scheduleDataList[i];
                        var endTime = GO.util.dateWithoutTimeZone(schedule.endTime);
                        var startTime = GO.util.dateWithoutTimeZone(schedule.startTime);
                        var isLongAndStartedAtPastSchedule = endTime.diff(startTime, "days") >= 1 && startTime.isBefore(date);
                        var isStartedAtLastWeekSchedule = date.format("d") === "0" && moment(schedule.startTime).week() !== date.week();

                        if (isLongAndStartedAtPastSchedule) {
                            var scheduleListStartedAtPast = _this.dataGroupedByDate[MHelper.formatInYYYYMMDD(schedule.startTime)];
                            scheduleListStartedAtPast = _this.filterSameSchedule(scheduleListStartedAtPast, date);
                            _.each(scheduleListStartedAtPast, function (comparisonTarget) {
                                if (comparisonTarget.id === schedule.id) {
                                    if (isStartedAtLastWeekSchedule) {
                                        setScheduleForRender(schedule);
                                    } else {
                                        setScheduleForNotRender(comparisonTarget, schedule);
                                    }
                                }
                            });
                        } else {
                            setScheduleForRender(schedule);
                        }
                    }
                    scheduleSet.push(firstSchedule, secondSchedule);
                    return scheduleSet;
                };

                var makeDayDetailData = function (schedule, date) {
                    var scheduleStartTime = moment(schedule['startTime']);
                    var scheduleEndTime = moment(schedule['endTime']);
                    var nextDay = moment(GO.util.basicDate3(date.clone().add(1, 'days')));
                    var scheduleColor = function () {
                        if (schedule.isRedColor) {
                            return "";
                        } else {
                            return schedule.calendarColor;
                        }
                    };
                    var getPeriodForRender = function () {
                        if (schedule.alreadyRender) {
                            return;
                        }

                        if (scheduleEndTime.format("HH:mm") === "00:00" && schedule['timeType'] === "timed") {
                            scheduleEndTime.subtract('seconds', 1)
                        }
                        var _period = scheduleEndTime.diff(scheduleStartTime, 'days') + 1;
                        if (scheduleEndTime.week() !== scheduleStartTime.week()) {
                            if (date.week() === scheduleStartTime.week()) {
                                _period = 6 - parseInt(scheduleStartTime.format("d")) + 1;
                            } else if (date.week() === scheduleEndTime.week()) {
                                _period = parseInt(scheduleEndTime.format("d")) + 1;
                            } else {
                                _period = 7;
                            }
                        }
                        return _period;
                    };
                    return {
                        "period": getPeriodForRender(),
                        "alreadyRender": !_.isUndefined(schedule.alreadyRender) ? schedule.alreadyRender : false,
                        "isAllDayScheduleOfCalenderMenu": GO.router.getUrl().indexOf("asset") === -1 && (!(scheduleStartTime.isAfter(date) && nextDay.isAfter(scheduleEndTime))),
                        "color": scheduleColor,
                        "name": schedule.name,
                        "isHoliday": schedule.isRedColor,
                        "isSecret": schedule.visibility === "private"
                    };
                };

                var date = start.clone();

                for (var weekIdx = 0; weekIdx < CalTbView.getWeekCount(start, end); weekIdx++) {

                    var weekDays = [];
                    for (var wdayIdx = 0; wdayIdx < 7; wdayIdx++) {
                        weekDays.push(makeDayData(date));
                        date.add(1, 'days');
                    }

                    templateData['weeks'].push({
                        'weekId': weekIdx + "_week",
                        'weekDays': weekDays
                    });
                }
                return templateData;
            },

            _onDateClicked: function (e) {
                var $target = $(e.currentTarget);
                var dateInYYYYMMDD = $target.attr('data-date');
                this._markSelected(dateInYYYYMMDD);
            },

            _markSelected: function (date) {
                var dataListInDate = this.filterSameSchedule(this.dataGroupedByDate[date], date);
                this.$el.find('.bg_row td').removeClass('on').filter('[data-date="' + date + '"]').addClass('on');
                this.observer.trigger('dateSelected', moment(date), dataListInDate);
            }
        },
        {
            getStart: function (date) {
                var firstOfMonth = date.clone().startOf('month');
                return firstOfMonth.subtract(firstOfMonth.day(), 'days');
            },

            getLast: function (date) {
                var lastOfMonth = date.clone().endOf('month');
                return lastOfMonth.add(6 - lastOfMonth.day(), 'days');
            },

            getWeekCount: function (start, end) {
                var dateCount = end.diff(start, 'days') + 1;
                return dateCount / 7;
            },

            sortEvents: function (dataList) {
                dataList.sort(compareFunc);

                function compareFunc(a, b) {
                    var timeTypeI = {'allday': 1, 'timed': 2};

                    return new SortPipe(a, b)
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
                            return moment(a.startTime).valueOf() - moment(b.startTime).valueOf();
                        })
                        .pipe(function diffCreateDate(a, b) {
                            return moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf();
                        })
                        .run();
                }

                function compareDateString(a, b) {
                    var aSdt = a.split('T')[0];
                    var bSdt = b.split('T')[0];
                    var result = -1;

                    if (aSdt > bSdt) {
                        result = 1;
                    } else if (aSdt === bSdt) {
                        result = 0;
                    }

                    return result;
                }

                function SortPipe(a, b) {
                    this.a = a;
                    this.b = b;

                    this.__result__ = 0;

                    this.pipe = function (compareFunc) {
                        if (this.__result__ === 0) {
                            this.__result__ = compareFunc(this.a, this.b);
                        }
                        return this;
                    };

                    this.run = function () {
                        return this.__result__;
                    }
                }
            },
            /**
             * 주어진 데이터 목록을 날짜(시간 없이) 별로 그룹핑한다.
             *
             * 만약, startTime과 endTime이 2일 이상에 걸친 경우,
             * 데이터는 2개 이상의 날짜에 각각 포함된다.
             *  ex. 데이터1의 기간이 5/1 ~ 5/3이라면
             *     그룹핑 결과는 {'2015-05-01':[데이터1], '2015-05-02':[데이터1]}) 이다.
             *
             * @param {Object[]} dataList
             * @param {Moment} dataList.startTime 시작시간
             * @param {Moment} dataList.endTime 종료시간
             * @return {Object} groupByDate 날짜별로 그룹핑된 데이터 {'날짜': [데이터목록], '날짜': ...}
             */
            groupByDate: function (dataList) {
                var grouped = {};

                _.each(dataList, function (data) {
                    var keys = [];
                    var start = data['startTime'];
                    var end = data['endTime'];

                    if (data['alldayType']) {
                        start = GO.util.dateWithoutTimeZone(start);
                        end = GO.util.dateWithoutTimeZone(end);
                    } else {
                        start = moment(start);
                        end = moment(end);
                    }

                    for (var i = 0; i <= end.diff(start, 'days'); i++) {
                        var day = start.clone().add(i, 'days');
                        keys.push(MHelper.formatInYYYYMMDD(day));
                    }

                    _.each(keys, function (key) {
                        if (!_.isArray(grouped[key])) {
                            grouped[key] = [];
                        }

                        grouped[key].push(data);
                    });
                });

                return grouped;
            },

            generateTbClass: function (date, currentMonth) {
                var classes = [];

                if (MHelper.getMonth(date) != currentMonth) {
                    classes.push("other_month");
                }

                if (GO.util.isToday(date)) {
                    classes.push("today");
                }
                return classes.join(' ');
            }
        });

    /**
     * 특정 날짜가 선택 되었을 때, 날짜에 소속된 데이터 목록을 하단에 표현해주는 뷰
     */
    var DayDataListView = Backbone.View.extend({

        tagName: "dl",
        attributes: {id: "minicalendar_datalist"},
        className: "list_type3 list_today",
        events: {
            'vclick a[data-btntype="eventWrap"]': '_onDataInDataListClicked',
        },
        initialize: function (options) {
            this.date = options.date;
            this.dataList = options.dataList;
            if (!_.isArray(this.dataList)) {
                this.dataList = [];
            }
            this.dateDataEmptyMessage = options.dateDataEmptyMessage;
        },

        render: function () {
            this.$el.html(this._makeTemplate().render(this._makeTemplateData()));
            return this;
        },

        _makeTemplate: function () {
            var htmls = [];
            htmls.push('<dt>');
            htmls.push('    <span class="txt {{#isHoliday}}holiday_off{{/isHoliday}} {{^isHoliday}}{{isWeekend}}{{/isHoliday}}">{{todayLabel}}</span>');
            htmls.push('    {{#isHoliday}}');
            htmls.push('    <span class="txt {{#isHoliday}}holiday_off{{/isHoliday}}">{{holidayName}}</span>');
            htmls.push('    {{/isHoliday}}');
            htmls.push('</dt>');
            htmls.push('{{^dataList}}');
            htmls.push('<dd class="data_null_s">');
            htmls.push('    <span class="txt">{{empty_data_list_message}}</span>');
            htmls.push('</dd>');
            htmls.push('{{/dataList}}');
            htmls.push('{{#dataList}}');
            htmls.push('<dd>');
            htmls.push('    <a data-bypass data-btntype="eventWrap" data-id="{{dataId}}" data-calendarId="{{calendarId}}" data-url="{{dataURL}}" data-visibility="{{visibility}}" href="javascript:;">');
            htmls.push('        {{#thumbnail}}');
            htmls.push('        <div class="wrap_photo">');
            htmls.push('            <span class="photo">');
            htmls.push('            <img src="{{thumbnail}}">');
            htmls.push('            </span>');
            htmls.push('        </div>');
            htmls.push('        {{/thumbnail}}');
            htmls.push('        <div class="info">');
            htmls.push('            {{^isAllDay}}<span class="time">{{dataDuration}}</span>{{/isAllDay}}');
            htmls.push('            <span class="subject {{#otherCompanyReservation}}multi_user{{/otherCompanyReservation}}">');
            htmls.push('                {{#isSecret}}');
            htmls.push('                <span class="btn btn_secret_s"></span>');
            htmls.push('                {{/isSecret}}');
            htmls.push('                <span class="txt_ellipsis">{{name}}</span>');
            htmls.push('                </span>');
            htmls.push('            <span class="ic ic_arrow_type2"></span>');
            htmls.push('        </div>');
            htmls.push('        <span class="chip bgcolor{{calendarColor}}"></span>');
            htmls.push('    </a>');
            htmls.push('</dd>');
            htmls.push('{{/dataList}}');
            return Hogan.compile(htmls.join(''));
        },

        _makeTemplateData: function () {
            var isHoliday = false;
            var holidayName = null;

            var mappedDataList = _.map(this.dataList, function (data) {
                var duration = this._formatDuration(this.date, data['startTime'], data['endTime'], data['alldayType']);
                var getThumbnail = function (data) {
                    var thumbnailList = _.isNull(sessionStorage.getItem("calendar-thumbnail-list")) ? [] : JSON.parse(sessionStorage.getItem("calendar-thumbnail-list"));
                    var calendarOwnerId = data['calendarOwnerId'];
                    if (_.isUndefined(calendarOwnerId) || data['hasMultipleAttendees']) {
                        return (GO.contextRoot + "resources/images/mobile/photo_profile_group.jpg");
                    }

                    var _thumbnail = null;
                    _.any(thumbnailList, function (thumbnail) {
                        if (thumbnail.id === calendarOwnerId) {
                            _thumbnail = thumbnail.thumbnail;
                            return true;
                        }
                    });

                    if (!_.isNull(_thumbnail)) {
                        return _thumbnail;
                    }
                    var thumbnail = UserProfileModel.read(calendarOwnerId).get("thumbSmall");
                    var profile = {
                        "id": calendarOwnerId,
                        "thumbnail": thumbnail
                    };
                    thumbnailList.push(profile);
                    sessionStorage.setItem("calendar-thumbnail-list", JSON.stringify(thumbnailList));
                    return thumbnail;
                };

                var getNameOfOtherCompany = function (data) {
                    if (!_.isUndefined(data['companyName'])) {
                        return [data['companyName'], data['name']].join(" ");
                    }
                    return data['name'];
                };

                return {
                    'dataId': data['id'],
                    'calendarId': data['calendarId'],
                    'name': data['otherCompanyReservation'] ? getNameOfOtherCompany(data) : data['name'],
                    'dataURL': data['moveURL'],
                    'dataDuration': duration,
                    'isRedColor': data['isRedColor'],
                    'isAllDay': data['isAllDay'],
                    'otherCompanyReservation': data['otherCompanyReservation'],
                    'visibility': data['visibility'],
                    'calendarColor': data['calendarColor'],
                    'thumbnail': getThumbnail(data),
                    'isSecret': data['visibility'] === "private"
                }
            }, this).filter(function (data) {
                if (data['isRedColor']) {
                    isHoliday = true;
                    holidayName = data['name'];
                    return false;
                }
                return true;
            });

            var isWeekend = $.proxy(function () {
                var day = this.date.format("dd");
                if (day.indexOf("토") > -1) {
                    return "sat";
                } else if (day.indexOf("일") > -1) {
                    return "sun"
                } else {
                    return "";
                }
            }, this);

            return {
                'todayLabel': this._formatListTitle(this.date),
                'empty_data_list_message': this.dateDataEmptyMessage,
                'dataList': mappedDataList,
                'isHoliday': isHoliday,
                'holidayName': holidayName,
                'isWeekend': isWeekend
            };
        },

        _formatListTitle: function (date) {
            return GO.util.formatDatetime(date, null, "MM.DD (dd)");
        },

        _formatDuration: function (date, from, to, alldayType) {
            if (alldayType) {
                return calendarLang['종일'];
            }
            var formatted = '';
            if (date.isSame(from, 'days')) {
                formatted += GO.util.formatDatetime(from, null, "MM.DD(ddd) HH:mm");
            } else {
                formatted += lang['continue'];
            }

            formatted += ' ~ ';
            var isFinishedAtYesterdayMidnight = moment(to).format("HH:mm") === "00:00" && moment(to).clone().subtract("days", 1).isSame(date, 'days');
            if (date.isSame(to, 'days') || isFinishedAtYesterdayMidnight) {
                formatted += GO.util.formatDatetime(to, null, "MM.DD(ddd) HH:mm");
            } else {
                formatted += lang['continue'];
            }

            return formatted;
        },

        _onDataInDataListClicked: function (e) {

            e.preventDefault();
            e.stopPropagation();
            GO.EventEmitter.trigger('calendar', 'calendar-day-click', moment(this.date._d).format("YYYY-MM-DD"));
            var $target = $(e.currentTarget);
            var url = $target.attr('data-url');

            if ($('body').data('sideApp') == "asset") {
                App.router.navigate(url, {
                    trigger: true,
                    pushState: true
                });
            } else {
                $.ajax({
                    type: "GET",
                    url: GO.contextRoot + "api/calendar/" + $target.attr("data-calendarId") + "/event/" + $target.attr("data-id"),
                }).done(function (event) {
                    var eventData = event.data;
                    var auth = _.where(eventData.attendees, {id: GO.session("id")}).length > 0;
                    if (eventData && (eventData.visibility !== 'private' || auth)) {
                        App.router.navigate(url, {
                            trigger: true,
                            pushState: true
                        });
                    }
                }).fail(function () {
                    return;
                });
            }
        }
    });


    /**
     * 캘린더에 표현할 외부 데이터 관리
     *
     * @constructor
     */
    var DataManager = function (options) {
        /*
        * 속도 문제로 여러 달의 일정을 불러오는 것이 아닌 해당 달의 일정만 불러오도록 수정 -> cacheManager 사용 안함.
        * */
        var cacheManager = new CacheManager();
        var loadData = options.loadData;

        function filterByDate(dataList, start, end) {
            return _.filter(dataList, function (data) {
                return (GO.util.toISO8601(data['startTime']) <= GO.util.toISO8601(end)) &&
                    (GO.util.toISO8601(data['endTime']) >= GO.util.toISO8601(start));
            });
        };

        return {
            fetchMonth: function (year, month) {
                var deferred = $.Deferred();
                var startDate = MHelper.startOfMonth(year, month);
                var from = CalTbView.getStart(startDate);
                var to = CalTbView.getLast(startDate);
                loadData(from, to).done(function (dataList) {
                    var start = CalTbView.getStart(startDate);
                    var end = CalTbView.getLast(startDate);
                    var dataListInMonth = filterByDate(dataList, start, end);
                    deferred.resolve(dataListInMonth);
                });

                return deferred.promise();
            },

            fetchSideMonth: function (year, month) {
                GO.util.appLoading(true);
                var deferred = $.Deferred();
                var startDate = MHelper.startOfMonth(year, month);
                var from = CalTbView.getStart(startDate);
                var to = CalTbView.getLast(startDate);
                loadData(from, to).done(function (dataList) {
                    deferred.resolve(dataList);
                });
                return deferred.promise();
            }
        }
    };


    /**
     * DataManager의 데이터를 캐시로 관리하도록 도와주는 모듈
     *
     * @returns
     * @constructor
     */
    var CacheManager = function () {

        var cache = {};
        return {

            set: function (year, month, dataList) {
                if (!cache[year]) {
                    cache[year] = {};
                }

                cache[year][month] = dataList;
            },

            get: function (year, month) {
                if (!cache[year]) {
                    return [];
                }

                return cache[year][month] || [];
            },

            clear: function (year, month) {
                if (!cache[year]) {
                    cache[year] = {};
                    return;
                }

                delete cache[year][month];
            },

            reset: function () {
                cache = {};
            }
        };
    };


    /**
     * 휴일 일정 관리
     */
    var HolidayManager = function () {

        function findHoliday(calendarList) {
            return _.find(calendarList, function (calendar) {
                return calendar['type'] == 'holiday';
            });
        };

        function newEventPools(calendarId, start, end) {
            var pools = new EventPools();
            pools.setBoundaryTime(start, end);
            pools.add(calendarId);
            return pools;
        };

        function newCalendars() {
            var calendars = new Calendars();
            calendars.setUserId(GO.session().id);
            return calendars;
        };

        function filterByDate(holidays, start, end) {
            return _.filter(holidays, function (holiday) {
                return (holiday.get('startTime') <= GO.util.toISO8601(end)) &&
                    (holiday.get('endTime') >= GO.util.toISO8601(start));
            });
        }

        var fetched = {};

        return {

            holidayList: [],

            fetch: function (start, end) {
                var ctx = this;
                var deferred = $.Deferred();
                var calendars = newCalendars();
                var midDate = start.clone().add((Math.abs(start.diff(end)) / 2));
                var year = MHelper.getYear(midDate);

                if (fetched[year]) {
                    deferred.resolve(filterByDate(fetched[year], start, end));
                    return deferred.promise();
                }

                calendars.fetch().done(function (cals) {
                    var holidayCal = findHoliday(cals.data);
                    var startOfYear = MHelper.startOfYear(year);
                    var endOfYear = MHelper.endOfYear(year);
                    var eventPools = newEventPools(holidayCal.id, startOfYear, endOfYear);

                    eventPools.fetch().done(function (pool) {
                        ctx.holidayList = pool.__collections__[holidayCal.id].models;
                        fetched[year] = ctx.holidayList;
                        deferred.resolve(filterByDate(fetched[year], start, end));
                    });
                });

                return deferred.promise();
            },

            isHoliday: function (date) {
                var matched = _.find(this.holidayList, function (holiday) {
                    return moment(holiday.get('startTime')).format("YYYYMMDD") == date.format("YYYYMMDD");
                });
                return _.isObject(matched);
            }
        };
    };


    /**
     * 모멘트 사용을 짧은 API로 사용할 수 있게 해주는 헬퍼
     */
    var MHelper = {

        formatInYYYYMMDD: function (date) {
            return GO.util.formatDatetime(date, null, "YYYY-MM-DD");
        },

        now: function () {
            return GO.util.now();
        },

        getYear: function (value) {
            return parseInt(value.format('YYYY'));
        },

        getMonth: function (value) {
            return parseInt(value.format('M'));
        },

        startOfYear: function (year) {
            return GO.util.now().year(year).startOf('year');
        },

        endOfYear: function (year) {
            return GO.util.now().year(year).endOf('year');
        },

        startOfMonth: function (year, month) {
            return GO.util.now().year(year).month(month - 1).startOf('month');
        },

        addMonth: function (date, num) {
            return date.add(num, 'months');
        },

        subtractMonth: function (date, num) {
            return date.subtract(num, 'months');
        }
    };


    return MiniCalendarApp;

});