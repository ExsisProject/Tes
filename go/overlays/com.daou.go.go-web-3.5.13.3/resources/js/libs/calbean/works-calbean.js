(function ($, moment) {
    "use strict";

    var _slice = Array.prototype.slice;

    var DAYS_IN_WEEK = 7;
    var SCHEDULE_TYPE = {'day': 'day', 'time': 'time'};
    var TIME_TYPE = {'timed': 'timed', 'allday': 'allday'};
    var COLOR_CODE_PREFIX = {'time': 'txtcolor', 'day': 'bgcolor'};
    var JS_CUSTOM_EVENTS = {
        // 외부 -> 내부 이벤트
        update_period_color: "update:period-color",
        reset_events: "reset:events",
        change_date: "change:date",
        change_view_type: "change:view-type",
        resize: "resize:calendar",

        // 내부 -> 외부 이벤트
        request_show_event: "request:show-event",
        request_create_event: "request:create-event",
        changed_date: "changed:date",
        changed_time: "changed:time",
        changed_view_type: "changed:view-type"
    };

    // 객체 복사 함수
    var _clone = function (obj, deep) {
        if (typeof deep === 'undefined') deep = false;
        // Array 객체
        if (obj.constructor === Array) return _slice.call(obj);

        // 그외 객체
        var clonedObj = new Object();
        for (var key in obj) {
            clonedObj[key] = typeof (obj[key]) === 'object' && deep ? _clone(obj[key]) : obj[key];
        }
        return clonedObj;
    };

    // 객체가 해당 name 값을 가지고 있는지 검사
    var _hasValue = function (obj, value) {
        if (typeof obj !== 'object') throw new Error("Invalid object.");
        for (var _key in obj) {
            if (obj[_key] === value) return true;
        }
        return false;
    };

    // 날짜 포맷 오류 클래스
    var InvalidDateFormatException = (function () {
        var InvalidDateFormatException = function () {
            return new Error("Invalid date format");
        };

        return InvalidDateFormatException;
    })();

    // 시간 포맷 유효성 체크
    var validateDateFormat = function () {
        var args = _slice.call(arguments),
            len = args.length;
        for (var _i = 0; _i < len; _i++) {
            if (!moment(args[_i]).isValid()) return false;
        }
        return true;
    };

    // 같은 일자인가?
    var isSameDate = function (date1, date2) {
        var _d1 = moment(date1).clone().startOf('day'),
            _d2 = moment(date2).clone().startOf('day');
        return _d1.diff(_d2) === 0;
    };

    // 일요일인가?
    var isSunday = function (date) {
        return moment(date).day() === 0;
    };

    // 토요일 인가?
    var isSaturday = function (date) {
        return moment(date).day() === 6;
    };

    // 오늘 인가?
    var isToday = function (date) {
        return isSameDate(date, new Date());
    };

    // 같은 월인가?
    var isSameMonth = function (date1, date2) {
        var _d1 = moment(date1).clone().startOf('month'),
            _d2 = moment(date2).clone().startOf('month');
        return _d1.diff(_d2) === 0;
    };

    // 이전 월인가?
    var isPrevMonth = function (me, basedate) {
        var _base = moment(basedate).clone().startOf('month').toDate(),
            _me = moment(me).clone().startOf('month').toDate();
        return _me < _base;
    };

    // 이후 월인가?
    var isNextMonth = function (me, basedate) {
        var _base = moment(basedate).clone().startOf('month').toDate(),
            _me = moment(me).clone().startOf('month').toDate();
        return _me > _base;
    };

    var disableTextSelection = function (el) {
        $(el).attr('unselectable', 'on')
            .css('MozUserSelect', 'none')
            .bind('selectstart.ui', function () {
                return false;
            });
    };

    var computeDateRange = function (sdt, edt) {
        return Math.ceil(moment(edt).diff(sdt, 'day', true));
    };

    var EventMatrix = (function () {
        // constructor
        var Klass = function (options) {
            this.options = $.extend({
                date: new Date(),
                startday: 0,
                width: DAYS_IN_WEEK, // 열 크기(기본값은 7)
                events: []
            }, options || {});

            this.matrix = [];
            this.rows = 0;
            this.cols = 0;

            this.__eventsIndex__ = {};

            _buildMatrix.call(this);
            _initEvents.call(this);
        };

        Klass.prototype = {
            updateEvent: function (tevent) {
                if (!tevent.id) {
                    throw new Error('이벤트 ID가 필요합니다.');
                }

                var ev = this.findEventById(tevent.id);
                $.extend(true, ev, tevent);
                this.reset();
            },

            resetEvents: function (events) {
                this.options.events = events;
                _initEvents.call(this);
            },

            setStartday: function (startday) {
                if (this.options.startday === startday) return;
                this.options.startday = startday;
                _initEvents.call(this);
            },

            isValidEvent: function (ev) {
                var _sDT = moment(ev.startTime),
                    _eDT = moment(ev.endTime);
                return validateDateFormat(_sDT, _eDT);// && !(_eDT.diff(_sDT) < 0)) // endTime 이 startTime 을 앞설 경우 표시해줘야 함
            },

            findEventById: function (eventId) {
                return this.options.events[this.__eventsIndex__[eventId]];
            },

            getAxis: function (date) {
                var _d = moment(date),
                    _startOfMonth = moment(this.options.date).clone().startOf('month').day(),
                    _offsetDay = isSameMonth(date, this.options.date) ? _startOfMonth : _d.clone().startOf('month').day() + this.options.startday,
                    _offset = this.options.width === 1 ? _offsetDay : _offsetDay % this.options.width,
                    _offsetDate = _offset + _d.date(),
                    axis = {x: 0, y: 0};

                if (isPrevMonth(date, this.options.date)) {
                    axis.x = 0;
                } else if (isNextMonth(date, this.options.date)) {
                    axis.x = this.getAxisXOfLast();
                } else {
                    axis.x = (this.options.width === 1 ? _offsetDate - 1 : Math.floor((_offsetDate - 1) / this.options.width));
                }

                axis.y = this.options.width === 1 ? 0 : (_offset + _d.date()) % this.options.width - 1;
                if (axis.y < 0) axis.y = this.options.width + axis.y;
                // 잘못된 좌표정보는 예외 발생
                if (axis.x < 0 || axis.x > this.getRowCount() || axis.y > this.getColCount()) throw new Error("Invalid axis of matrix");
                return axis;
            },

            getCell: function (x, y) {
                return this.matrix[x][y];
            },

            getCellByDate: function (date) {
                var axis = this.getAxis(date);
                return this.getCell(axis.x, axis.y);
            },

            getRow: function (index) {
                return this.matrix[index];
            },

            getRowByDate: function (date) {
                return this.getRow(this.getAxis(date).x);
            },

            getRowCount: function () {
                return this.rows;
            },

            getColCount: function () {
                return this.cols;
            },

            getFirstCell: function () {
                return this.matrix[0][0];
            },

            getLastCell: function () {
                return this.matrix[this.getAxisXOfLast()][this.getAxisYOfLast()];
            },

            getAxisXOfLast: function () {
                return this.rows - 1;
            },

            getAxisYOfLast: function () {
                return this.cols - 1;
            }
        };

        function _getOffsetYOfStartDate(date, startday) {
            var offset = date.day() - startday;
            if (offset < 0) offset = this.options.width + offset;
            return offset;
        };

        function _buildMatrix() {
            var _d = new Date(this.options.date.getTime()),
                _moment = moment(_d),
                _msd = _moment.clone().startOf('month'),
                // 시작일의 시작 인덱스의 열 계산
                _startOffset = _getOffsetYOfStartDate(_msd, this.options.startday),
                // 월의 마지막 일에 대한 Date 객체
                _med = _moment.clone().endOf('month'),
                _mstart = _msd.clone().subtract('days', _startOffset),
                // 매트릭스 크기
                _matrix = {
                    cols: this.options.width,
                    rows: Math.ceil((_med.date() + _startOffset) / this.options.width)
                };

            for (var _row = 0; _row < _matrix.rows; _row++) {
                for (var _col = 0; _col < _matrix.cols; _col++) {
                    if (!(this.matrix[_row] instanceof Array)) this.matrix[_row] = [];
                    this.matrix[_row][_col] = {
                        instance: _mstart.clone().toDate(),
                        year: _mstart.year(),
                        month: _mstart.month(),
                        date: _mstart.date(),
                        day: _mstart.day(),
                        today: isToday(_mstart),
                        events: [],
                        // 이벤트에 포함되지 않는 공휴일, 기념일 등은 별도로 계산한다.
                        flags: [],
                        axisX: _row,
                        axisY: _col
                    };
                    // 하루 증가
                    _mstart.add('days', 1);
                }
            }

            this.rows = _matrix.rows;
            this.cols = _matrix.cols;

            return this.matrix;
        };

        // 종일일정인가?
        function _isAllday(evt) {
            return evt.timeType === TIME_TYPE.allday;
        }

        function _initEvents() {
            var _fD = this.getFirstCell().instance,
                _lD = this.getLastCell().instance,
                _evLen = this.options.events.length;

            for (var _i = 0; _i < _evLen; _i++) {
                var startDate, endDate,
                    startOffset = 0, duration = 0, totalRows = 0,
                    // 루프 체크 변수들...
                    _sDT, _eDT, _range, _axis = {x: 0, y: 0}, _cR = 0,
                    _loop = 0,
                    // 일정이 차지하는 총 행 수에서 현재 행 수 초기값
                    _curRow = 1,
                    // 그 행의 시작 셀인가?
                    _isStartCellOfRow = true,
                    _slotIndex = -1,
                    _ev = this.options.events[_i],
                    _dateOfFirstCell = moment(this.getFirstCell().instance);

                if (_.isUndefined(_ev.startTime)) {
                    _ev.startTime = _ev.endTime;
                } else if (_.isUndefined(_ev.endTime)) {
                    _ev.endTime = _ev.startTime;
                }

                if (!this.isValidEvent(_ev)) continue;
                if (_isAllday(_ev)) {
                    startDate = moment(_ev.startTime, "YYYY-MM-DD").clone().startOf('days');
                    endDate = moment(_ev.endTime, "YYYY-MM-DD").clone();
                } else {
                    // 시작 일시 계산 - 00:00:00초로 만든다.
                    startDate = moment(_ev.startTime).clone().startOf('days');
                    // 종료 일시 계산 - 23:59:59초로 만든다.
                    endDate = moment(_ev.endTime).clone();
                }

                if (endDate.format("HH:mm:ss") === "00:00:00" && _ev.timeType === "timed") {
                    // 종료일시가 00:00이면 1초를 빼서 전날 23:59:59로 만든다.
                    _ev.endTime = endDate.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                    endDate.subtract('seconds', 1);
                } else {
                    endDate.endOf('days');
                }

                // 시작일 위치 offset
                startOffset = _getOffsetYOfStartDate(startDate, this.options.startday);
                // 실제 일정 기간(일정 표시 중 화살표 표현 등에 사용)
                duration = computeDateRange(startDate, endDate);
                // 일정이 차지하는 실제 행수 계산(몇 주에 걸친 일정인가?)
                // _range 값은 기준 월내의 범위이기 때문에 다음달에 걸친 일정은 이달의 마지막 셀까지의 길이로 계산한다.
                // 따라서, 실제 일정값을 계산해 줌.
                if (this.options.width > 1) {
                    totalRows = Math.ceil((duration + startOffset) / this.options.width);
                } else {
                    totalRows = duration;
                }

                // 시간에 상관없이 시작시간은 그날의 00:00:00으로, 종료시간은 23:59:59로 만든다.
                // 이렇게 하면 일정의 종류에 상관없이 차지해야 하는 셀의 갯수를 바로 구할 수 있다.
                var isStartLessThanFirst = moment(_ev.startTime).toDate() < _fD;
                var isEndGreaterThanLast = moment(_ev.endTime).toDate() > _lD;
                _sDT = (isStartLessThanFirst ? moment(_fD).clone().startOf('days') : startDate);
                _eDT = (isEndGreaterThanLast ? moment(_lD).clone().endOf('days') : endDate);

                // 시작 셀 좌표 계산
                _axis = this.getAxis(_sDT);

                // 매트릭스 내 일정 길이 계산
                _range = computeDateRange(_sDT, _eDT);

                // 현재 행번호 기억
                _cR = +_axis.x;
                // 루프 카운트 초기화
                if (!isStartLessThanFirst && !isEndGreaterThanLast && (_range == -0 || _range < 0)) {
                    _loop = 1;
                } else {
                    _loop = +_range;
                }

                // 이벤트의 시작일자가 달력의 첫번째셀 일자보다 이전일이면 curRow 초기값을 다시 설정(GO-11926 이슈 대응)
                if (startDate.isBefore(moment(_dateOfFirstCell), 'day')) {
                    var tempOffset = computeDateRange(startDate, _dateOfFirstCell),
                        tempRows = Math.ceil(tempOffset / this.options.width);

                    _curRow += tempRows;
                }

                while (_loop > 0) {
                    // dateMatrix의 events 배열 가져오기
                    var _cell = this.getCell(_axis.x, _axis.y),
                        _eomx = _cell.events,
                        // 현재 행의 남은 cell 수 계산: 열수 - 요일 index - 1 + 시작 요일 index
                        _restCellOfRow = (this.options.width - _sDT.day() - 1 + this.options.startday),
                        // 몇개의 속성은 바로 접근가능하도록 한다.
                        _eH = {
                            id: _ev.id,
                            type: _ev.type,
                            summary: _ev.summary,
                            range: _range,
                            total_rows: totalRows,
                            current_row: +_curRow,
                            _ref: _ev
                        };

                    // 렌더링 여부 결정
                    _eH['render'] = true;
                    // slot 인덱스를 처음 찾을 경우 비어있는 슬롯을 찾는다.
                    if (_slotIndex === -1) {
                        _slotIndex = _findEmptyEventSlot(_eomx);
                    }

                    // 1일 이상 일정이면?
                    if (_range > 1) {
                        // 그 행의 시작 셀이면 colspan 값을 기록
                        if (_isStartCellOfRow) {
                            // 그 주의 나머지 셀이 존재하면 colspan 값 기록
                            //  colspan 값 계산 규칙 :
                            //  - 해당 주의 남은 셀크기와 남은 일정의 크기(_loop) 중 작은 값을 colspan 값으로 한다.
                            //  - _restCellOfRow 값은 자기 자신을 포함하지 않은 셀 갯수이므로 colspan 표현시 +1을 해줘야 한다.
                            if (_restCellOfRow > 0) _eH['colspan'] = (_loop > _restCellOfRow) ? _restCellOfRow + 1 : _loop;
                            _isStartCellOfRow = false;
                        } else {
                            _eH['render'] = false;
                        }
                    }

                    // events 배열에 추가
                    _cell.events[_slotIndex] = _eH;

                    // 이벤트 찾기 쉽게 인덱스 기록
                    this.__eventsIndex__[_ev.id] = _i;

                    if (isSameDate(_sDT, _eDT)) break;

                    // 현재 행번호 기억
                    _cR = +_axis.x;
                    // 시작 시간 하루 증가
                    _sDT.add('days', 1);
                    // 다음 셀좌표 정보 재계산
                    _axis = this.getAxis(_sDT);
                    // 행이 바뀌었을 경우 관련 플래그 변경
                    if (_axis.x > _cR) {
                        _curRow++;
                        _isStartCellOfRow = true;
                        _slotIndex = -1;
                    }

                    // 루프값 감소
                    _loop--;
                }
            }
        };

        // 이벤트 슬롯 중 가장 처음 찾을 수 잇는 빈 슬롯의 배열 인덱스 반환
        var _findEmptyEventSlot = function (events) {
            var slotIndex = 0;
            for (var i = 0, len = events.length; i <= len; i++) {
                if (typeof events[i] === 'undefined') {
                    slotIndex = i;
                    break;
                }
            }
            return slotIndex;
        };

        /*
         * Static Methods
         */
        Klass.__cache__ = {};
        Klass.getInstance = function (options) {
            var _moment = moment(options['date'] || new Date()),
                _searchKey = _moment.format("YYYYMM");
            if (Klass.__cache__[_searchKey] == null || typeof Klass.__cache__[_searchKey] === 'undefined') {
                Klass.__cache__[_searchKey] = new Klass(options);
            }

            return Klass.__cache__[_searchKey];
        };

        return Klass;
    })();

    $.fn.calbean = function (opts) {

        var options = $.extend(true, {
            type: "weekly",
            // 시작 일자(Date.prototype.getDay() 가 반환하는 값. 정수형. 기본값은 일요일(0))
            startday: 0,
            date: new Date(),
            lang: 'ko',
            lazy: false,
            height: 0,
            maxRows: 4,
            events: [],
            i18n: {
                "시간": "시간",
                "닫기": "닫기"
            }
        }, opts || {});

        // 지역 상수 정의
        var WEEKDAY_NAMES = moment.weekdaysShort(),
            VIEW_TYPE = {d: 'daily', w: 'weekly', m: 'monthly'},
            ID_PREFIX = "calbean-calendar-",
            CLASS_NAME = "calbean_calendar_view",
            LANG = options.i18n;

        var // Namespace
            cb = {},
            $me = $(this);

        disableTextSelection(this);

        // 초기화
        var init = function () {
            var _i = ($("." + CLASS_NAME).length);
            if (!$me.attr("id")) $me.attr("id", ID_PREFIX + _i);
            if (!$me.hasClass(CLASS_NAME)) $me.addClass(CLASS_NAME);

            unbindJSEvent();
            bindJSEvent();
        };

        /**
         * 이벤트 정렬
         *
         * [ 정렬 알고리즘 ]
         * 1. 시작일자가 빠른 순
         * 2. 종료일자가 느린 순
         * 3. 종일일정이 먼저
         * 4. 시작일자 + 시간 빠른 순(시간일정 때문에 필요)
         * 5. 등록일이 먼저
         * 6. 그외에는 정렬 안함
         */
        var sortEvents = function () {
            options.events.sort(compareFunc);

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
                if (_.isUndefined(a) || _.isUndefined(b)) {
                    return 0;
                }
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
        };

        /*
         * Javascript Event 관련 정의
         * 컴포넌트 외부와의 커뮤니케이션은 모두 커스텀 이벤트를 이용하여 수행한다.
         */
        var unbindJSEvent = function () {
            for (var _eventKey in JS_CUSTOM_EVENTS) {
                $me.off(JS_CUSTOM_EVENTS[_eventKey]);
            }

            // 일정링크 이벤트 off
            $me.off("click", "a.schedule");
        };

        // 일정보기 이벤트 트리거
        var _triggerShowEvent = function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            var $target = $(e.currentTarget);
            $me.trigger(JS_CUSTOM_EVENTS.request_show_event, [$target.attr("data-periodid"), $target.attr("data-id")]);
        };

        // 캘린더 뷰 리사이즈
        var resize = function (e, height) {
            $me.height(height);
            options.height = height;
            render();
        };

        // 캘린더 뷰 타입 변경
        var changeViewType = function (e, type) {
            if (!_hasValue(VIEW_TYPE, type)) throw new Error("Invalid view type.");
            options.type = type;
            render();
        };

        // 기준 일자 변경
        var changeDate = function (e, date, events) {
            var _m = moment(date);
            events = events || [];

            if (!validateDateFormat(_m)) throw new InvalidDateFormatException();
            options.date = _m.toDate();
            _addEvents(events || []);
            render();
        };

        // period 색상 변경 콜백 함수
        var updatePeriodColor = function (e, id, code) {
            var isDirty = false;
            var len = options.events.length;

            for (var _i = 0; _i < len; _i++) {
                var _e = options.events[_i];
                if (_e.periodId != id) continue;
                if (_e.color === code) continue;
                _e.color = code;
                isDirty = true;
            }

            // 다시 그린다.
            if (isDirty) render();
        };

        // 이미 존재하는 이벤트인가?
        var isExistedEvent = function (eventId) {
            var len = options.events.length;
            for (var _i = 0; _i < len; _i++) {
                if (options.events[_i].id === eventId) return true;
            }
        };

        // 이벤트 추가 함수
        var _addEvents = function (events) {
            var isDirty = false;
            events = events || [];

            if (events.length > 0) {
                var len = events.length;
                for (var i = 0; i < len; i++) {
                    var tevent = events[i];
                    if (isExistedEvent(tevent.id)) continue;
                    options.events.push(tevent);
                    isDirty = true;
                }
                if (isDirty) sortEvents();
            }
            return isDirty;
        };

        var resetEvents = function (e, events, opts) {
            options.events = [];
            render(events || [], opts);
        };

        var bindJSEvent = function () {
            $me.on(JS_CUSTOM_EVENTS.update_period_color, updatePeriodColor);
            $me.on(JS_CUSTOM_EVENTS.reset_events, resetEvents);
            $me.on(JS_CUSTOM_EVENTS.change_view_type, changeViewType);
            $me.on(JS_CUSTOM_EVENTS.change_date, changeDate);
            $me.on(JS_CUSTOM_EVENTS.resize, resize);

            // 일정 링크 이벤트
            $me.on("click", "a.schedule", _triggerShowEvent);
        };
        // 종일일정(범위 일정 포함) 인가?
        var isScheduleDayType = function (evt, range) {
            return (range > 1 || (range <= 1 && evt.timeType === TIME_TYPE.allday));
        };
        // 시간 표시 텍스트 만들기
        var buildTimeTextHtml = function (date) {
            return ['<span class="time">', moment(date).format("HH:mm"), '</span>'].join("");
        };

        function makeTimelineHeaderScrollFix(tagname) {
            tagname = tagname || 'td';

            return '<' + tagname + ' class="scroll_area timeline-scrollfix"></' + tagname + '>';
        }

        // 범위일정 HTML 구조 생성 클래스(공통)
        var RangeEventHtmlBuilder = (function () {
            var BUILD_TYPE = {calendar: 'calendar', timeline: 'timeline'};

            // constructor
            var Klass = function (matrix) {
                this.matrix = matrix;
                // 표시 일정 행수 제한(기본값: 0, 제한안함)
                this.limit = 0;
                // 뷰 타입 지정(calendar / timeline)
                this.type = '' + BUILD_TYPE.calendar;
                // 클래스
                this.classnames = {'tr': [], 'td': []};
            };

            Klass.prototype = {
                /**
                 표시 일정수 제한 설정

                 @method setLimit
                 @param {Integer} limit 제한할 값
                 @chainable
                 */
                setLimit: function (limit) {
                    this.limit = limit;
                    return this;
                },

                /**
                 캘린더 타입 설정(calendar/timeline)

                 @method setType
                 @param {String} type 타입
                 @chainable
                 */
                setType: function (type) {
                    this.type = type;
                    return this;
                },

                /**
                 tr/td 클래스(CSS) 이름 추가

                 @method addClass
                 @param {String} dest 대상 테이블 태그 엘리먼트(tr/td)
                 @param {String} classname 추가할 클래스 명
                 @chainable
                 */
                addClass: function (dest, classname) {
                    this.classnames[dest].push(classname);
                    return this;
                },

                /**
                 범위 일정 HTML 생성

                 @method build
                 @return {String} HTML
                 @chainable
                 */
                build: function () {
                    var html = [],
                        len = this.matrix.length,
                        totalRows = this._computeTotalRows(this.matrix, this.limit),
                        trClasses = this._generateClassForTable('tr'),
                        tdClasses = this._generateClassForTable('td'),
                        _row = 0;

                    this._rebuildEventsAndFlags();

                    do {
                        html.push(['<tr', trClasses, '>'].join(""));
                        // 타임라인 형태는 첫번째 행에 라벨을 추가 해준다.
                        if (_row === 0 && this._isTimelineType()) {
                            html.push('<th', totalRows > 0 ? [' rowspan="', totalRows + 1, '"'].join("") : "", '></th>');
                        }

                        for (var _i = 0; _i < len; _i++) {
                            var _rebuildSchedule = this.matrix[_i].rebuildSchedule,
                                _date = moment(this.matrix[_i].instance).format("YYYY-MM-DD"),
                                dayEvent = '',
                                colspan = '';

                            if (_rebuildSchedule.length > _row && _rebuildSchedule[_row]) {
                                // 범위일정은 시작일에서 그렸기 때문에 생략.
                                if (_rebuildSchedule[_row].render === false) continue;
                                // 그주의 colspan 값이 있으면 그림.
                                if (_rebuildSchedule[_row]['colspan']) colspan = ' colspan="' + _rebuildSchedule[_row]['colspan'] + '"';
                                // 이벤트를 그린다.
                                dayEvent = this._buildDayEvent(_rebuildSchedule[_row]);
                            }

                            html.push(['<td', tdClasses, colspan, ' data-date="', _date, '">'].join(""));
                            html.push(dayEvent);
                            html.push('</td>');
                        }

                        if (this._isTimelineType()) {
                            html.push(makeTimelineHeaderScrollFix());
                        }
                        html.push("</tr>");

                        _row++;
                    } while (_row < totalRows);

                    if (totalRows > 0) html.push(this._buildBlankRow(totalRows));

                    return html.join("");
                },
                /**
                 출력될 범위 일정 갯수 계산

                 @method _computeTotalRows
                 @return {Integer} row 수
                 @private
                 */
                _computeTotalRows: function () {
                    var _len = this.matrix.length;
                    var eventsMax = 0;
                    var flagsMax = 0;

                    for (var _i = 0; _i < _len; _i++) {
                        eventsMax = Math.max(eventsMax, this._getEventCount(this.matrix[_i].events));
                        if (this._isTimelineType()) {
                            flagsMax = Math.max(flagsMax, this._getEventCount(this.matrix[_i].flags));
                        }
                    }

                    return eventsMax + flagsMax;
                },

                _rebuildEventsAndFlags: function () {
                    var self = this;
                    var _maxFlagsCnt = 0;
                    var isTimeline = this._isTimelineType();
                    _.each(this.matrix, function (matrix) {
                        _maxFlagsCnt = Math.max(self._getEventCount(matrix.flags), _maxFlagsCnt);
                    });

                    _.each(this.matrix, function (matrix) {
                        if (isTimeline) {
                            var _rebuildSchedule = [],
                                _events = matrix.events,
                                _flags = matrix.flags,
                                _dummyArray = new Array(_maxFlagsCnt - _flags.length);

                            _rebuildSchedule = _rebuildSchedule.concat(_dummyArray, _flags, _events);
                            matrix.rebuildSchedule = _rebuildSchedule;
                        } else {
                            matrix.rebuildSchedule = matrix.events;
                        }
                    });
                },

                /**
                 빈 슬롯용 HTML 생성
                 - calendar 타입이면 +more 갯수가 있는 셀은 more 갯수 출력
                 - timeline 타입이면 빈슬롯 출력

                 @method _buildBlankRow
                 @private
                 */
                _buildBlankRow: function (totalRows) {
                    var html = [],
                        len = this.matrix.length,
                        trClasses = this._generateClassForTable('tr'),
                        tdClasses = this._generateClassForTable('td');

                    html.push(['<tr', trClasses, '>'].join(""));
                    for (var _i = 0; _i < len; _i++) {
                        var _events = this.matrix[_i].events,
                            _date = moment(this.matrix[_i].instance).format("YYYY-MM-DD"),
                            _restCount = _events.length - totalRows;

                        html.push(['<td', tdClasses, ' data-date="', _date, '">'].join(""));
                        if (!this._isTimelineType() && _restCount > 0) {
                            html.push(['<a class="btn_schedule_more" href="#" data-bypass>+', _restCount, LANG["{{count}} 개"], '</a>'].join(""));
                        }
                        html.push('</td>');
                    }
                    html.push("</tr>");
                    return html.join("");
                },

                /**
                 일정 행 총 갯수 계산
                 - calendar 타입이면 일정 총 갯수와 limit 로 지정된 갯수 중 작은 값을 리턴
                 - timeline 타입이면 범위일정 총 갯수에 1을 더해서 리턴(빈 영역이 한줄 나와야 하므로...)

                 @method _getEventCount
                 @param {Array} events 일정 배열
                 @return {Integer} row 수
                 @private
                 */
                _getEventCount: function (events) {
                    var count = 0;
                    if (this._isTimelineType()) {
                        var len = events.length;
                        for (var _i = 0; _i < len; _i++) {
                            var tevent = events[_i];
                            if (tevent && isScheduleDayType(tevent._ref, tevent.range)) count++;
                        }
                    } else {
                        count = this.limit > 0 ? Math.min(events.length, this.limit) : events.length;
                    }

                    return count;
                },

                /**
                 tr/td 클래스 구문 생성

                 @method _generateClassForTable
                 @param {String} target 'tr' or 'td'
                 @return {String} 클래스명 구문
                 @private
                 */
                _generateClassForTable: function (target) {
                    return this.classnames[target].length > 0 ? [' class="', this.classnames[target].join(" "), '"'].join("") : '';
                },

                /**
                 일자별 일정 표시 HTML 생성

                 @method _buildDayEvent
                 @param {Object} cell 각 셀별 일정 데이터
                 @return {String} 클래스명 구문
                 @private
                 */
                _buildDayEvent: function (cell) {
                    var html = [], classes1 = [], classes2 = ['schedule'],
                        classPrefix = "schedule_",
                        range = cell.range,
                        scheduleType = SCHEDULE_TYPE.time + '', // 복사해야 한다.
                        curEvent = _clone(cell._ref),
                        tailDiv = [],
                        summary = curEvent.summary;

                    var permission = curEvent.actions;
                    if (permission && permission.updatable) {
                        classes1.push("draggable");
                    }

                    if (isScheduleDayType(curEvent, range)) scheduleType = SCHEDULE_TYPE.day;

                    // 타임라인 방식이면 시간지정 일정은 그리지 않는다.
                    if (this._isTimelineType() && scheduleType === SCHEDULE_TYPE.time) return '';

                    classes1.push(classPrefix + "day"); //classPrefix + scheduleType

                    // 2주 이상 걸친 일정일 경우 화살표 출력
                    if (cell.total_rows > 1) {
                        if (cell.current_row > 1) {
                            classes1.push('schedule_day_left');
                            tailDiv.push('<div class="tail_l"><div></div></div>');
                        }

                        if (cell.current_row < cell.total_rows) {
                            classes1.push('schedule_day_right');
                            tailDiv.push('<div class="tail_r"><div></div></div>');
                        }
                    }

                    // 캘린더별 색상코드 반영
                    classes1.push("bgcolor" + (curEvent.color || "1"));

                    // 이벤트 ID를 기준으로 엘리먼트를 찾기쉽도록 클래스 추가
                    classes1.push("ev-" + curEvent.id);

                    html.push('<div el-event class="', classes1.join(' '), '">', "\n");
                    html.push(tailDiv.join("\n"));
                    html.push('<a href="#" class="', classes2.join(' '), '" title="', summary, '" data-id="', cell.id,
                        '" data-docId="', curEvent.docId,
                        '" data-periodId="', curEvent.periodId, '" data-duration="', cell.range,
                        '" data-startdate="', curEvent.startTime, '" data-enddate="', curEvent.endTime,
                        '" data-bypass>', "\n");

                    if (curEvent.timeType === TIME_TYPE.timed) {
                        html.push(buildTimeTextHtml(curEvent.startTime), "\n"); // 시간일정에 시간값 추가
                    }
                    if (curEvent.startTime > curEvent.endTime) {
                        html.push('<span class="ic ic_caution_mini"></span>');
                    }
                    html.push('<span>', summary, '</span>', "\n");
                    html.push('</a>', "\n");
                    html.push('</div>', "\n");
                    return html.join("");
                },

                // 타임라인 타입인가?
                _isTimelineType: function () {
                    return !!(this.type === BUILD_TYPE.timeline);
                }
            };

            return Klass;
        })();

        /**
         나머지 일정 보기 Layer

         @class EventMoreLayerView
         */
        var EventMoreLayerView = (function () {
            /**
             생성자

             @class EventMoreLayerView
             @constructor
             */
            var Klass = function () {
                this.id = "layer-schedule-more";
                this.$el = this._createElement();
                this.$el.draggable({
                    containment: $('#calendar-viewport'),
                    handle: '.drag_area',
                    cursor: 'move'
                });
                this.delegateEvents();
            };

            Klass.prototype = {
                render: function (e, date, events) {
                    this._setPosition(e.currentTarget);
                    this.$el.find("ul").empty().append(this._buildEventList(date, events));
                    this.$el.find("span.date").text(moment(date).format("DD"));
                    this._bindDraggable();
                    return this;
                },

                _bindDraggable: function () {
                    var twidth = $("table.bg_row td").first().width();
                    this.$el.find(".draggable").draggable({
                        containment: ".month_body",
                        cursor: "move",
                        appendTo: ".month_body",
                        revert: "invalid",
                        cursorAt: {left: twidth / 2, top: 10},
                        helper: function (event) {
                            var $clone = $(this).clone();
                            $clone.width(twidth);
                            $clone.addClass('dragged');
                            return $clone;
                        },
                        start: function () {
                            var $this = $(this),
                                eventId = $this.find("a").data("id");
                            $(".ev-" + eventId).css("opacity", 0.7);
                        },
                        stop: function (e, ui) {
                            var $this = $(this),
                                eventId = $this.find("a").data("id");
                            var promise = $(ui.helper.context).data("promise");
                            if (promise === undefined) {
                                $(".ev-" + eventId).css("opacity", 1.0);
                                this.remove();
                            } else {
                                promise.done($.proxy(function () {
                                    $(".ev-" + eventId).css("opacity", 1.0);
                                    this.remove();
                                }, this));
                            }
                        }
                    });
                },

                delegateEvents: function () {
                    $("body").on("click.schedule-more", $.proxy(this._blur, this));
                    this.$el.on("click", "a.schedule", $.proxy(this._showEvent, this));
                    this.$el.on("click", ".ic_close_s2", $.proxy(this.remove, this));
                    this.$el.on("mouseover", ".drag_area > .btn_border", $.proxy(this._disableDrag, this));
                    this.$el.on("mouseout", ".drag_area > .btn_border", $.proxy(this._enableDrag, this));
                    return this;
                },

                undelegateEvents: function () {
                    $("body").off("click.schedule-more");
                    this.$el.off();
                    return this;
                },

                /**
                 레이어 엘리먼트 제거 및 이벤트 바인딩 해제

                 @method remove
                 @chainable
                 */
                remove: function () {
                    this.undelegateEvents();
                    this.$el.remove();
                    Klass.__instance__ = null;
                    return this;
                },

                /**
                 일정 보기 이벤트 콜백

                 @method _showEvent
                 @param {$.Event} 이벤트 객체
                 @private
                 @chainable
                 */
                _showEvent: function (e) {
                    _triggerShowEvent(e);
                    this.remove();
                    return this;
                },

                /**
                 레이어 외부 클릭 이벤트 콜백

                 @method _blur
                 @param {$.Event} 이벤트 객체
                 @private
                 @chainable
                 */
                _blur: function (e) {
                    var $target = $(e.target);
                    if ($target.is("a.btn_schedule_more")) return;
                    if (!this.$el.is(":visible")) return;
                    if ($target.parents('#' + this.id).length > 0) return;
                    this.remove();
                    return this;
                },

                /**
                 드래그 활성화

                 @method _enableDrag
                 @private
                 @chainable
                 */
                _enableDrag: function () {
                    this.$el.draggable('enable');
                    return this;
                },

                /**
                 드래그 비활성화

                 @method _disableDrag
                 @private
                 @chainable
                 */
                _disableDrag: function () {
                    this.$el.draggable('disable');
                    return this;
                },

                /**
                 레이어 위치 설정

                 @method _setPosition
                 @param {Object} caller 호출한 엘리먼트 객체
                 @private
                 @chainable
                 */
                _setPosition: function (caller) {
                    this._setOffsetX(caller);
                    this._setOffsetY(caller);
                    return this;
                },

                /**
                 레이어 X 좌표 위치 설정

                 @method _setOffsetX
                 @param {Object} caller 호출한 엘리먼트 객체
                 @private
                 @chainable
                 */
                _setOffsetX: function (caller) {
                    var $caller = $(caller),
                        windowWidth = $(window).width(),
                        offsetX = $caller.offset().left,
                        rOffsetX = offsetX + this.$el.outerWidth();

                    if (rOffsetX > windowWidth) offsetX = windowWidth - this.$el.outerWidth();
                    this.$el.css("left", offsetX + "px");
                    return this;
                },

                /**
                 레이어 Y 좌표 위치 설정

                 @method _setOffsetX
                 @param {Object} caller 호출한 엘리먼트 객체
                 @private
                 @chainable
                 */
                _setOffsetY: function (caller) {
                    var $caller = $(caller),
                        offsetY = $caller.parent().parent().parent().offset().top;

                    this.$el.css("top", offsetY + "px");
                    return this;
                },

                /**
                 레이어 엘리먼트 객체 생성

                 @method _setOffsetX
                 @param {Object} caller 호출한 엘리먼트 객체
                 @return {jQuery} jQuery 객체
                 @private
                 */
                _createElement: function () {
                    if (!$("#" + this.id).length) {
                        this._buildLayerWrapper();
                    }
                    return $("#" + this.id);
                },

                /**
                 레이어 엘리먼트 객체 Wrapper HTML 생성

                 @method _buildLayerWrapper
                 @private
                 @chainable
                 */
                _buildLayerWrapper: function () {
                    var html = [];
                    html.push(['<div id="', this.id, '" class="layer_normal layer_schedule_more layer_calbean_calendar_view">'].join(''));
                    html.push('<div class="title drag_area">');
                    html.push(['<span class="date"></span>'].join(""));
                    html.push('<span class="btn_border">');
                    html.push('<span class="ic_classic ic_close_s2" title="' + LANG["닫기"] + '"></span>');
                    html.push('</span>');
                    html.push('</div>');
                    html.push('<ul>');
                    html.push('</ul>');
                    html.push('</div>');
                    $("body").append(html.join("\n"));
                    return this;
                },

                /**
                 일정 목록 HTML 구조 문자열 생성

                 @method _buildEventList
                 @param {Date or String} date 날짜
                 @param {Array} events 일정 목록
                 @return {String} HTML
                 @private
                 */
                _buildEventList: function (date, events) {
                    var html = [];

                    html.push('<li>');
                    for (var _i = 0, len = events.length; _i < len; _i++) {

                        if (!events[_i] || typeof events[_i] === 'undefined') {
                            continue;
                        }

                        var tevent = events[_i],
                            eventRef = tevent._ref,
                            color = eventRef.color,
                            startTime = moment(eventRef.startTime),
                            endTime = moment(eventRef.endTime),
                            isAlldayType = isScheduleDayType(eventRef, tevent.range),
                            isRanged = (isAlldayType && tevent.range > 1),
                            isStartDate = isSameDate(date, startTime),
                            isEndDate = isSameDate(date, eventRef.endTime),
                            colorPrefix = '',
                            classes = [];

                        var permission = eventRef.actions;
                        if (permission && permission.updatable) {
                            classes.push("draggable");
                        }

                        classes.push("schedule_day");

                        if (isRanged && isStartDate) {
                            classes.push("schedule_day_left");
                        }

                        if (isRanged && isEndDate) {
                            classes.push("schedule_day_right");
                        }
                        colorPrefix = COLOR_CODE_PREFIX[SCHEDULE_TYPE.day];

                        classes.push(colorPrefix + color);

                        html.push(['<div el-event class="', classes.join(" "), '">'].join(""));

                        if (isRanged) {
                            if (isStartDate) html.push('<div class="tail_l"><div></div></div>');
                            if (isEndDate) html.push('<div class="tail_r"><div></div></div>');
                        }

                        html.push([
                            '<a href="#" class="schedule" title="', eventRef.summary,
                            '" data-startdate="', startTime, '" data-enddate="', endTime,
                            '" data-startTime="', eventRef.startTime, '" data-endTime="', eventRef.endTime,
                            '" data-docid="', eventRef.docId,
                            '" data-periodid="', eventRef.periodId,
                            '" data-id="', tevent.id, '" data-duration="', 1, '" data-bypass>'
                        ].join(""));

                        if (eventRef.startTime > eventRef.endTime) {
                            html.push('<span class="ic ic_caution_mini"></span>');
                        }
                        html.push(['<span>', eventRef.summary, '</span>'].join(""));
                        html.push('</a>');
                        html.push('</div>');
                    }
                    html.push('</li>');
                    return html.join("\n");
                }
            };

            Klass.__instance__ = null;

            /**
             싱글톤 인스턴스 생성 및 반환

             @method create
             @return {Object} 인스턴스
             @static
             */
            Klass.create = function () {
                if (this.__instance__ === null) {
                    this.__instance__ = new Klass();
                }
                return this.__instance__;
            };

            /**
             레이어 제거 및 객체 레퍼런스 해제

             @method release
             @return {Object} 인스턴스
             @static
             */
            Klass.release = function () {
                var instance = this.create();
                instance.remove();
                this.__instance__ = null;
            };
            return Klass;
        })();

        /**
         월간일정 뷰 클래스

         @class MonthlyView
         */
        var MonthlyView = (function () {
            var // 컨테이너 클래스
                MONTHLY_CLASS_NAME = "calendar_month",
                // 이벤트 네임스페이스
                EVENT_NS = 'calbean-monthly';

            /**
             생성자

             @class MonthlyView
             @constructor
             */
            var Klass = function (options) {
                this.options = _.clone(options);
                this.matrix = new EventMatrix(this.options);
                this.rowCount = this.matrix.getRowCount();

                this.maxRows = options.maxRows;

                this.undelegateEvents();
                this.delegateEvents();
            };

            Klass.prototype = {
                /**
                 render

                 @method render
                 @chainable
                 */
                render: function () {
                    var html = [];
                    // maxRow 를 계산해준다.
                    this.maxRows = Math.floor((this.options.height / this.rowCount) / 22) - 2;

                    html.push(this._buildTableHeader());
                    html.push(this._buildMonthBody());
                    $me.empty().html(html.join("\n"));

                    this._resetClass(this, VIEW_TYPE.m);
                    this._resize(this.options.height);

                    this._bindDND();
                    return this;
                },

                _bindDND: function () {
                    var twidth = $me.find("table.bg_row td").first().width();
                    // IE8에서 distance 옵션이 적용되지 않는다.(D&D 자체가 안됨)
                    $me.find(".draggable").draggable({
                        containment: ".month_body",
                        cursor: "move",
                        appendTo: ".month_body",
                        revert: "invalid",
                        cursorAt: {left: twidth / 2, top: 10},
                        helper: function (event) {
                            var $clone = $(this).clone();
                            $clone.width(twidth);
                            $clone.addClass('dragged');
                            return $clone;
                        },
                        start: function () {
                            var $this = $(this),
                                eventId = $this.find("a").data("id");
                            $(".ev-" + eventId).css("opacity", 0.7);
                        },
                        stop: function (e, ui) {
                            var promise = $(ui.helper.context).data("promise");
                            var $this = $(this),
                                eventId = $this.find("a").data("id");
                            if (promise == undefined) {
                                $(".ev-" + eventId).css("opacity", 1.0);
                            } else {
                                promise.done(function () {
                                    $(".ev-" + eventId).css("opacity", 1.0);
                                });
                            }
                        }
                    });

                    $me.find("table.bg_row td").droppable({
                        accept: ".draggable",
                        tolerance: "intersect",
                        drop: function (e, ui) {
                            var $aEl = $(ui.draggable).find("a"),
                                docId = $aEl.data("docid"),
                                periodId = $aEl.data("periodid"),
                                oldStartDt = $aEl.data('startdate'),
                                newStartDt = $(this).data("date");

                            $(this).removeClass("on");

                            if (!isSameDate(oldStartDt, newStartDt)) {
                                $me.trigger(JS_CUSTOM_EVENTS.changed_date, [docId, periodId, newStartDt, $(ui.draggable)]);
                            }
                        },
                        over: function (event, ui) {
                            $(this).addClass("on");
                        },
                        out: function (event, ui) {
                            $(this).removeClass("on");
                        }
                    });
                },

                delegateEvents: function () {
                    $me.on(JS_CUSTOM_EVENTS.change_view_type + '.' + EVENT_NS, $.proxy(this._resetClass, this));
                    $me.on("click." + EVENT_NS, "table.bg_row, table.schedule_row th, table.schedule_row th note, table.schedule_row td:empty", $.proxy(this._requestCreateEvent, this));
                    $me.on("click." + EVENT_NS, "table.schedule_row span.day", function (e) {
                        var $target = $(e.target);
                        $me.trigger(JS_CUSTOM_EVENTS.changed_view_type, [VIEW_TYPE.d, $target.parent().attr("data-date")]);
                    });
                    $me.on("click." + EVENT_NS, "a.btn_schedule_more", $.proxy(this._showMoreEvent, this));
                    return this;
                },

                undelegateEvents: function () {
                    $me.off("." + EVENT_NS);
                    return this;
                },

                /**
                 나머지 일정 보기 레이어 호출

                 @method _showMoreEvent
                 @param {$.Event} $.Event 객체
                 @private
                 @chainable
                 */
                _showMoreEvent: function (e) {
                    e.preventDefault();
                    var $target = $(e.currentTarget),
                        date = $target.parent().attr("data-date"),
                        cell = this.matrix.getCellByDate(date),
                        layer = EventMoreLayerView.create();

                    layer.render(e, date, cell.events, this.options);

                    e.stopImmediatePropagation();
                    return this;
                },

                /**
                 캘린더 타입 변경 이벤트 콜백

                 @method _resetClass
                 @param {$.Event} $.Event 객체
                 @param {String} 변경할 타입 명(daily/weekly/monthly)
                 @private
                 @chainable
                 */
                _resetClass: function (e, type) {
                    // TO-DO : 객체 생성과 change_view_type 이벤트가 동시에 들어왔을 때 두번 호출되는 문제 있음
                    if (type === VIEW_TYPE.m) {
                        $me.addClass(MONTHLY_CLASS_NAME);
                    } else {
                        $me.removeClass(MONTHLY_CLASS_NAME);
                    }
                    return this;
                },

                /**
                 캘린더 높이 변경 이벤트 콜백

                 @method _bindResizeJSEvent
                 @param {$.Event} $.Event 객체
                 @param {Integer} 캘린더 UI 높이
                 @private
                 @chainable
                 */
                _bindResizeJSEvent: function (e, height) {
                    this._resize(height);
                    return this;
                },

                /**
                 캘린더 높이 변경 함수

                 @method _resize
                 @param {Integer} 캘린더 UI 높이
                 @private
                 @chainable
                 */
                _resize: function (height) {
                    var heightPerRow = Math.floor((height - $me.find('.tb_month_header').outerHeight()) / this.rowCount);
                    $me.find('.week_schedule').height(heightPerRow);
                    return this;
                },

                /**
                 * Monthly 빈영역 클릭 이벤트 콜백
                 * @param e $.Event 객체
                 */
                _requestCreateEvent: function (e) {
                    if ($(e.target).attr('data-date')) {
                        $me.trigger(JS_CUSTOM_EVENTS.request_create_event, this.options.collection.appletId);
                    }
                },

                /**
                 캘린더 테이블 헤더 HTML 반환

                 @method _buildTableHeader
                 @return {String} HTML
                 @private
                 */
                _buildTableHeader: function () {
                    var html = [],
                        week = this.matrix.getRow(0);

                    html.push("<table class=\"type_normal tb_month_header tb_fix\">", "<thead><tr>", "\n");
                    // 일별 매트릭스의 1주 차를 가져와서 헤더를 그린다.
                    for (var _i = 0, len = week.length; _i < len; _i++) {
                        var day = week[_i].day,
                            dn = WEEKDAY_NAMES[day],
                            classes = [];
                        if (day === 0) classes.push('sun');
                        if (day === 6) classes.push('sat');
                        html.push("<th class=\"", classes.join(" "), "\">", dn, "</th>", "\n");
                    }
                    html.push("</tr></thead>", "</table>");
                    return html.join("");
                },

                /**
                 캘린더 달력몸통 HTML 생성

                 @method _buildMonthBody
                 @return {String} HTML
                 @private
                 */
                _buildMonthBody: function () {
                    var html = [];
                    html.push('<div class="month_body">');
                    for (var _i = 0, _rows = this.matrix.getRowCount(); _i < _rows; _i++) {
                        var curRow = this.matrix.getRow(_i);
                        html.push('<div class="week_schedule">');
                        html.push(this._buildWeekBgCells(curRow));
                        html.push(this._buildWeekScheduleRows(curRow));
                        html.push('</div>');
                    }
                    html.push('</div>');
                    return html.join("\n");
                },

                /**
                 캘린더 달력셀 배경 HTML 생성

                 @method _buildWeekBgCells
                 @param {Array} dayarrs 일정 배열
                 @return {String} HTML
                 @private
                 */
                _buildWeekBgCells: function (dayarrs) {
                    var html = [];
                    html.push("<tr>");
                    for (var _i = 0, len = dayarrs.length; _i < len; _i++) {
                        var _h = dayarrs[_i],
                            _date = moment(_h.instance).format("YYYY-MM-DD"),
                            classes = ["dt" + _date];

                        if (_h.today) classes.push("today");
                        html.push('<td class="', classes.join(" "), '" data-date="', _date, '"></td>', "\n");
                    }
                    html.push("</tr>");
                    return this._tableRowDecorator(html.join(""), "bg_row");
                },

                /**
                 캘린더 일정 표시 배경셀 HTML 생성

                 @method _buildWeekScheduleRows
                 @param {Array} dayarrs 일정 배열
                 @return {String} HTML
                 @private
                 */
                _buildWeekScheduleRows: function (dayarrs) {
                    var html = [];
                    html.push(this._buildWeekHeaders(dayarrs));
                    html.push(this._buildWeekEvents(dayarrs));
                    return this._tableRowDecorator(html.join(""), "schedule_row");
                },

                /**
                 캘린더 일정 HEADER HTML 생성

                 @method _buildWeekHeaders
                 @param {Array} dayarrs 일정 배열
                 @return {String} HTML
                 @private
                 */
                _buildWeekHeaders: function (dayarrs) {
                    var html = [],
                        len = dayarrs.length;

                    html.push("<tr>");
                    for (var _i = 0; _i < len; _i++) {
                        var _h = dayarrs[_i],
                            _date = moment(_h.instance).format("YYYY-MM-DD"),
                            classes = this._generateClassesOfWeekHeaders(_h, this.options.date);

                        html.push('<th class="', classes.join(" "), '" data-date="', _date, '">', "\n");
                        html.push('<span class="day">', _h.date, "</span>", "\n");
                        html.push('</th>', "\n");
                    }
                    html.push("</tr>");
                    return html.join("");
                },

                /**
                 캘린더 일정 HTML 생성

                 @method _buildWeekEvents
                 @param {Array} 일정 배열
                 @return {String} HTML
                 @use RangeEventHtmlBuilder
                 @private
                 */
                _buildWeekEvents: function (dayarrs) {
                    var htmlBuilder = new RangeEventHtmlBuilder(dayarrs);
                    htmlBuilder.setLimit(this.maxRows);
                    return htmlBuilder.build();
                },

                /**
                 달력의 th class 속성 생성

                 @method _generateClassesOfWeekHeaders
                 @param {Object} cell 일정셀 설정 객체
                 @param {Date or String} basedate 일자
                 @return {String}
                 @private
                 */
                _generateClassesOfWeekHeaders: function (cell, basedate) {
                    var classes = [],
                        _month = moment(basedate).month();
                    if (cell.month === _month && cell.day === 0) classes.push('sun');    // 일요일 표시
                    if (cell.month === _month && cell.day === 6) classes.push('sat');    // 토요일 표시
                    if (cell.month < _month) classes.push('before');   // 이전달 표시
                    if (cell.month > _month) classes.push('next');     // 다음달 표시
                    if (cell.today) classes.push('today'); // 오늘 표시

                    return classes;
                },

                /**
                 각 주별 table wrapper(decorator)

                 @method _tableRowDecorator
                 @param {String} td HTML 문자열
                 @param {String} cn 클래스명
                 @return {String} HTML
                 @private
                 */
                _tableRowDecorator: function (td, cn) {
                    if (typeof cn === 'undefined') cn = "";
                    if (cn !== "") cn = cn + " ";
                    var html = [];
                    html.push("<table class=\"", cn, "tb_fix\"><tbody>", "\n");
                    html.push(td, "\n");
                    html.push("</tbody></table>");
                    return html.join("");
                }
            };

            return Klass;
        })();

        /*
         * 주간, 일간 일정의 열 표시 뷰 클래스
         */
        var TimelineView = (function () {
            // 상수 정의
            var // 시간당 timeslot 갯수( 60 / 12 => 5분 )
                TIMESLOTS_PER_HOURS = 12,
                // timeslot 당 시간(분)
                MINUTES_PER_TIMESLOT = 60 / TIMESLOTS_PER_HOURS,
                // timeslots 당 높이
                HEIGHT_PER_TIMESLOT = MINUTES_PER_TIMESLOT,
                // 수직방향 SNAP 간격
                VERTICAL_SNAP_SIZE = 15,
                // 클래스 지정
                TIMELINE_CLASS_NAME = 'calendar_week',
                // 이벤트 네임스페이스
                EVENT_NS = 'calbean-timeline';

            /**
             생성자

             @class TimelineView
             @constructor
             */
            var Klass = function (from, to) {
                if (typeof to === 'undefined') to = from;
                this.__range = {from: new Date(), to: new Date()};

                if (!validateDateFormat(from, to)) {
                    throw new InvalidDateFormatException();
                }
                this.startday = 0;
                this.__range.from = moment(from).clone().toDate();
                this.__range.to = moment(to).clone().toDate();
                this.__duration = this._computeDuration(this.__range.from, this.__range.to);
                this.__scrollTop = -1;

                this.matrix = new EventMatrix({date: this.__range.from, width: this.__duration});

                $me.addClass(TIMELINE_CLASS_NAME);

                // 이벤트 바인딩
                this.undelegateEvents();
                this.delegateEvents();
            };

            Klass.prototype = {
                buildSkelecton: function () {
                    var html = [];
                    html.push(this._buildTimelineHeader());
                    html.push(this._buildTimelineBody());
                    $me.empty().html(html.join("\n"));

                    this._resize(options.height);
                    this._scrollTo();

                    var rangeEventRowHeight = $me.find('div.day_schedule table.schedule_row tr.row').length * 19;
                    $me.find("div.day_schedule table.bg_row tr").height(rangeEventRowHeight);
                    $me.find("div.day_schedule table.bg_row th").height(rangeEventRowHeight);
                },

                /**
                 render

                 @method render
                 @chainable
                 */
                render: function (options) {
                    var self = this;

                    this.buildSkelecton();

                    // 1일 이상의 일정만 드래그 앤 드랍 가능하도록 만든다.
                    if (this.__duration > 1) {
                        var twidth = $me.find("table.schedule_row td").last().width();
                        $me.find("table.schedule_row .draggable").draggable({
                            containment: "table.schedule_row tbody",
                            cursor: "move",
                            appendTo: "#calendar-viewport",
                            revert: "invalid",
                            cursorAt: {left: twidth / 2, top: 10},
                            helper: function (event) {
                                var $clone = $(this).clone();
                                $clone.width(twidth);
                                $clone.addClass('dragged');
                                return $clone;
                            },
                            start: function () {
                                var $this = $(this),
                                    eventId = $this.find("a").attr("data-id");
                                $(".ev-" + eventId).css("opacity", 0.7);
                            },
                            stop: function () {
                                var $this = $(this),
                                    eventId = $this.find("a").data("id");
                                $(".ev-" + eventId).css("opacity", 1.0);
                            }
                        });

                        $me.find("div.day_schedule table.bg_row td").droppable({
                            greedy: true,
                            accept: "table.schedule_row .draggable",
                            tolerance: "intersect",
                            drop: function (e, ui) {
                                var $aEl = $(ui.draggable).find("a"),
                                    docId = $aEl.data("docid"),
                                    periodId = $aEl.data("periodid"),
                                    oldStartDt = $aEl.data('startdate'),
                                    newStartDt = $(this).data("date");

                                $(this).removeClass("on");

                                if (!isSameDate(oldStartDt, newStartDt)) {
                                    $me.trigger(JS_CUSTOM_EVENTS.changed_date, [docId, periodId, newStartDt, null]);
                                }
                            },
                            over: function (event, ui) {
                                $(this).addClass("on");
                            },
                            out: function (event, ui) {
                                $(this).removeClass("on");
                            }
                        });
                    }

                    var dragPosY = 0,
                        wrapWidth = $(".schedule_wrap").first().outerWidth();

                    $me.find(".schedule_wrap .draggable").draggable({
                        containment: '.timeline_wrap',
                        cursor: "move",
                        appendTo: ".timeline_wrap",
                        revert: "invalid",
                        grid: [$(".schedule_wrap").first().outerWidth() + 21, VERTICAL_SNAP_SIZE],
                        drag: function (event, ui) {
                            var offsetTop = ui.offset.top,
                                diff = offsetTop - dragPosY,
                                delta = Math.abs(diff) + 5;

                            if (delta > VERTICAL_SNAP_SIZE) {
                                var $this = $(this),
                                    oldStartDt = moment($this.attr("data-starttime")),
                                    oldEndDt = moment($this.attr("data-endtime")),
                                    duration = oldEndDt.diff(oldStartDt, 'minutes'),
                                    startOfDay = oldStartDt.clone().startOf("days"),
                                    sOffset = Math.ceil(ui.position.top + 1),
                                    newStartTime = startOfDay.add('minutes', sOffset),
                                    newEndTime = newStartTime.clone().add('minutes', duration);

                                $(this).find('.time').text(newStartTime.format("HH:mm"));
                                $(this).attr('data-starttime', newStartTime.format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
                                $(this).attr('data-endtime', newEndTime.format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
                                dragPosY = +parseInt(offsetTop);
                            }
                        },

                        start: function (event, ui) {
                            var orgWidth = $(this).width(),
                                newWidth = parseInt($(this).css('left') || '0') > 0 ? $(this).width() : wrapWidth + 16;
                            self.preventClickEvent();
                            $(this).click(function () {
                                return false;
                            });
                            dragPosY = +parseInt(ui.offset.top);
                            $(this).css({'width': newWidth, 'opacity': 0.8, 'z-index': '100'});
                            $(this).attr({"data-org-starttime": $(this).data('starttime'), "data-org-width": orgWidth});
                        },

                        stop: function () {
                            $(this).css({'width': $(this).attr('data-org-width'), 'opacity': 1, 'z-index': 'auto'});
                            $(this)
                                .removeAttr("data-org-starttime")
                                .removeAttr("data-org-width");

                            dragPosY = 0;
                        }
                    });

                    $me.find(".tb_week_body tr.cols td").droppable({
                        greedy: true,
                        accept: ".schedule_time",
                        tolerance: "intersect",
                        drop: function (event, ui) {
                            var $draggable = $(ui.draggable),
                                eventId = $draggable.attr("data-id"),
                                periodId = $draggable.attr("data-periodid"),
                                orgStartDt = $draggable.attr("data-org-starttime"),
                                dSDt = moment($draggable.attr("data-starttime")),
                                dEDt = moment($draggable.attr("data-endtime")),
                                duration = dEDt.diff(dSDt, 'minutes'),
                                newDate = $(this).data('date'),
                                newStartTime = [newDate, "T", dSDt.format("HH:mm:ss.SSSZ")].join(""),
                                newEndTime = moment(newStartTime).clone().add('minutes', duration).format("YYYY-MM-DDTHH:mm:ss.SSSZ");

                            if (moment(newEndTime).format("HH:mm:ss") === "00:00:00") {
                                // 종료일시가 자정이면 1초를 빼서 전날 23:59:59로 만든다.
                                newEndTime = moment(newEndTime).subtract('seconds', 1).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                            }

                            if (moment(orgStartDt).valueOf() !== moment(newStartTime).valueOf()) {
                                $draggable.attr({"data-starttime": newStartTime, "data-endtime": newEndTime});
                            }
                            $me.trigger(JS_CUSTOM_EVENTS.changed_time, [eventId, periodId, newStartTime, newEndTime, $me.find('div.week_body_wrap').scrollTop()]);
                        }
                    });

                    $me.find(".schedule_wrap .resizable").resizable({
                        containment: 'parent',
                        handles: {'s': '.resize'},
                        grid: HEIGHT_PER_TIMESLOT,
                        // 시간일정 div의 마진값 때문에 5px을 빼줘야 한다.
                        minHeight: HEIGHT_PER_TIMESLOT,
                        autoHide: true,
                        start: function (e, ui) {
                            self.preventClickEvent();
                        },
                        stop: function (e, ui) {
                            var $this = $(this),
                                eventId = $this.attr("data-id"),
                                periodId = $this.attr("data-periodid"),
                                startTime = $this.attr("data-starttime"),
                                endTime = $this.attr("data-endtime"),
                                offsetMinutes = MINUTES_PER_TIMESLOT * Math.ceil($this.outerHeight() / HEIGHT_PER_TIMESLOT),
                                newEndTime = moment(startTime).add('minutes', offsetMinutes).format("YYYY-MM-DDTHH:mm:ss.SSSZ");

                            if (moment(newEndTime).format("HH:mm:ss") === "00:00:00") {
                                // 종료일시가 자정이면 1초를 빼서 전날 23:59:59로 만든다.
                                newEndTime = moment(newEndTime).subtract('seconds', 1).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                            }
                            $me.trigger(JS_CUSTOM_EVENTS.changed_time, [eventId, periodId, startTime, newEndTime, $me.find('div.week_body_wrap').scrollTop()]);
                        }
                    });
                    return this;
                },

                scrollTo: function (offset) {
                    this.__scrollTop = offset;
                },

                /**
                 preventClickEvent
                 : IE 에서 draggable, resizable 적용시, 이벤트가 해제되는 순간 timeline 배경에 바인딩된 click 이벤트가 호출된다.
                 이것을 막기위해 timeline 배경에 걸린 관련 이벤트를 off 시킨다.

                 drag, resize 이벤트가 종료된 후에는 다시 그려지므로 off된 이벤트를 복구할 필요는 없음

                 @method preventClickEvent
                 */
                preventClickEvent: function (on) {
                    $me.off(".calbean-timeline");
                },

                delegateEvents: function () {
                    $me.on("click." + EVENT_NS, "div.schedule_time", _triggerShowEvent);
                    $me.on(JS_CUSTOM_EVENTS.change_view_type + '.' + EVENT_NS, $.proxy(this._resetClass, this));
                    $me.on("click." + EVENT_NS, "td.cell:not(:has(div.schedule_day))", $.proxy(this._createEvent, this));
                    $me.on("click." + EVENT_NS, ".timeline_wrap", $.proxy(this._createEvent, this));
                    $me.on("click." + EVENT_NS, ".schedule_wrap", $.proxy(this._createEvent, this));
                    $me.on("mouseover." + EVENT_NS, ".resizable", function (e) {
                        $(e.currentTarget).find('.resize').show();
                    });
                    $me.on("mouseleave." + EVENT_NS, ".resizable", function (e) {
                        $(e.currentTarget).find('.resize').hide();
                    });
                    return this;
                },

                undelegateEvents: function () {
                    $me.off('.' + EVENT_NS);
                    return this;
                },

                /**
                 일정 설정

                 @method setEvents
                 @chainable
                 */
                setEvents: function (events) {
                    this.matrix.resetEvents(events);
                    return this;
                },

                /**
                 일정 재설정

                 @method resetEvents
                 @chainable
                 */
                resetEvents: function (events) {
                    this.matrix.resetEvents(events);
                    this.render();
                },

                /**
                 일정 시작요일 설정

                 @method setStartday
                 @chainable
                 */
                setStartday: function (startday) {
                    this.matrix.setStartday(startday);
                },

                /**
                 캘린더 타입 변경 이벤트 콜백

                 @method _resetClass
                 @param {$.Event} $.Event 객체
                 @param {String} 변경할 타입 명(daily/weekly/monthly)
                 @private
                 @chainable
                 */
                _resetClass: function (e, type) {
                    if ($.inArray(type, [VIEW_TYPE.w, VIEW_TYPE.d]) > -1) {
                        $me.addClass(TIMELINE_CLASS_NAME);
                    } else {
                        $me.removeClass(TIMELINE_CLASS_NAME);
                    }
                },

                /**
                 캘린더 높이 변경 이벤트 콜백

                 @method _bindResizeJSEvent
                 @param {$.Event} $.Event 객체
                 @param {Integer} 캘린더 UI 높이
                 @private
                 @chainable
                 */
                _bindResizeJSEvent: function (e, height) {
                    this._resize(height);
                },

                /**
                 * Timeline 빈영역 클릭 이벤트 콜백
                 * @param e $.Event 객체
                 */
                _createEvent: function (e) {
                    if ($(e.currentTarget).attr('data-date')) {
                        $me.trigger(JS_CUSTOM_EVENTS.request_create_event, this.options.collection.appletId);
                        return this;
                    }
                },

                /**
                 캘린더 높이 변경 함수

                 @method _resize
                 @param {Integer} 캘린더 UI 높이
                 @private
                 @chainable
                 */
                _resize: function (height) {
                    var theight = height - $me.find('.tb_week_header').outerHeight() - $me.find('.day_schedule').outerHeight();

                    $me.find('.timeline-scrollfix').width($me.find('.week_body_wrap').width() - $me.find('.tb_week_body').width());
                    $me.find('.week_body_wrap').height(theight);
                    return this;
                },

                /**
                 특정위치에 스크롤이 위치시킴

                 @method _scrollTo
                 @private
                 @chainable
                 */
                _scrollTo: function () {
                    var $wrap = $me.find("div.week_body_wrap"),
                        wH = $wrap.innerHeight(),
                        offset;

                    if (this.__scrollTop > -1) {
                        offset = this.__scrollTop;
                    } else {
                        var $timeline = $me.find("#current-timeline"),
                            tPT = $timeline.position().top;
                        // 현재시간이 오전 12시 이전이면 스크롤을 오전 7시 기준으로 맞춘다.
                        if (tPT < 550) {
                            offset = $(".timeline_wrap div[data-time='07:00:00']").position().top;
                        } else {
                            offset = tPT - (wH / 2);
                        }
                    }
                    if (offset > 0) $me.find("div.week_body_wrap").scrollTop(offset);
                    return this;
                },

                /**
                 기간 계산

                 @method _computeDuration
                 @param {Date or String} from 시작시간
                 @param {Date or String} to 종료시간
                 @return {Integer} 기간
                 @private
                 */
                _computeDuration: function (from, to) {
                    var sdt = moment(from).clone().startOf('day'),
                        edt = moment(to).clone().endOf('day');
                    return computeDateRange(sdt, edt);
                },

                /**
                 타임라인뷰 헤더 생성

                 @method _buildTimelineHeader
                 @return {String} HTML
                 @private
                 */
                _buildTimelineHeader: function () {
                    var html = [];
                    html.push(this._buildWeekHeader());
                    html.push('<div class="day_schedule">');
                    html.push(this._buildRangeEventBgCells());
                    html.push('<table class="schedule_row tb_fix">');
                    html.push('<tbody>');
                    html.push(this._buildRangeEvents());
                    html.push('</tbody>');
                    html.push('</table>');
                    html.push('</div>');
                    return html.join("\n");
                },

                /**
                 타임라인뷰 주간/일간 Header 생성

                 @method _buildWeekHeader
                 @return {String} HTML
                 @private
                 */
                _buildWeekHeader: function () {
                    var html = [],
                        _from = moment(this.__range.from).clone();
                    html.push('<table class="tb_week_header tb_fix">');
                    html.push('<thead class="type_normal">');
                    html.push('<tr>');
                    html.push('<th>' + LANG["시간"] + '</th>');
                    for (var _i = 0; _i < this.__duration; _i++) {
                        var classes = [],
                            dateStr = _from.format("MM.DD(ddd)");

                        if (isSunday(_from)) classes.push('sun');
                        if (isSaturday(_from)) classes.push('sat');
                        if (isToday(_from)) classes.push('today');
                        html.push(['<th', (classes.length > 0 ? [' class="', classes.join(" "), '"'].join("") : ''), '><span class="day">', dateStr, '</span></th>'].join(""));

                        // 다음날로 변경
                        _from.add('days', 1);
                    }
                    html.push(makeTimelineHeaderScrollFix('th'));
                    html.push('</tr>');
                    html.push('</thead>');
                    html.push('</table>');
                    return html.join("\n");
                },

                _buildRangeEventBgCells: function () {
                    var html = [],
                        _from = moment(this.__range.from).clone();

                    html.push('<table class="bg_row tb_fix">');
                    html.push('<tbody>');
                    html.push('<tr>');
                    html.push('<th></th>');
                    for (var _i = 0; _i < this.__duration; _i++) {
                        html.push('<td data-date="' + _from.format('YYYY-MM-DD') + '"></td>');
                        _from.add('days', 1);
                    }
                    html.push(makeTimelineHeaderScrollFix());
                    html.push('</tr>');
                    html.push('</tbody>');
                    html.push('</table>');
                    return html.join("\n");
                },

                /**
                 타임라인뷰 범위일정 바 생성

                 @method _buildRangeEvents
                 @return {String} HTML
                 @private
                 */
                _buildRangeEvents: function () {
                    var fromAxis = this.matrix.getAxis(this.__range.from),
                        matrix = this.matrix.getRow(fromAxis.x),
                        htmlBuilder = new RangeEventHtmlBuilder(matrix);

                    htmlBuilder.setType('timeline');
                    htmlBuilder.addClass('tr', 'row');
                    htmlBuilder.addClass('td', 'cell');
                    return htmlBuilder.build();
                },

                /**
                 타임라인뷰 BODY 생성

                 @method _buildTimelineBody
                 @return {String} HTML
                 @private
                 */
                _buildTimelineBody: function () {
                    var html = [];
                    html.push('<div class="week_body_wrap">');
                    html.push('<table class="tb_week_body tb_fix">');
                    html.push('<tbody>');
                    html.push(this._buildTimelineBgGrid());
                    html.push(this._buildTimelineEvents());
                    html.push('</tbody>');
                    html.push('</table>');
                    html.push('</div>');
                    return html.join("\n");
                },

                /**
                 타임라인뷰 배경 그리드 생성

                 @method _buildTimelineBody
                 @return {String} HTML
                 @private
                 */
                _buildTimelineBgGrid: function () {
                    var html = [],
                        tempDt = moment(new Date).startOf('days');

                    html.push('<tr style="height: 1px">');
                    html.push('<th style="width: 70px; height: 0"></th>');
                    html.push(['<td class="time_wrap"', this.__duration > 1 ? ' colspan="' + this.__duration + '"' : '', '>'].join(""));
                    html.push('<div class="timeline_wrap">');

                    for (var _i = 0; _i < 48; _i++) {
                        html.push("\t" + '<div class="timeline" data-time="' + tempDt.format('HH:mm:ss') + '"></div>');
                        tempDt.add('minutes', 30);
                    }

                    html.push('</div>');
                    html.push('</td>');
                    html.push('</tr>');
                    return html.join("\n");

                },

                /**
                 타임라인뷰 일정 생성

                 @method _buildTimelineEvents
                 @return {String} HTML
                 @private
                 */
                _buildTimelineEvents: function () {
                    var html = [];
                    html.push('<tr class="cols">');
                    html.push('<th>');
                    html.push(this._buildTimelineLabel());
                    html.push('</th>');
                    html.push(this._buileTimelineEventCols());
                    html.push('</tr>');
                    return html.join("\n");
                },

                /**
                 타임라인뷰 라벨 생성

                 @method _buildTimelineLabel
                 @return {String} HTML
                 @private
                 */
                _buildTimelineLabel: function () {
                    var html = [],
                        prefix = [],
                        _timer = moment().startOf('days'),
                        label = {am: _timer.clone().hours(1).format('A'), pm: _timer.clone().hours(12).format('A')};

                    // prefix 정의
                    prefix[0] = ['<span>', label.am, "</span> "].join("");
                    prefix[12] = ['<span>', label.pm, "</span> "].join("");

                    html.push('<div class="time_wrap">');
                    for (var _i = 0; _i < 24; _i++) {
                        html.push(["\t" + '<div class="time">', prefix[_i], _timer.format('hh'), '</div>'].join(""));
                        _timer.add('hours', 1);  // 1시간 증가
                    }
                    html.push(this._buildFlagOfCurrentTime());
                    html.push('</div>');
                    return html.join("\n");
                },

                /**
                 현재 시간 표시라인 HTML 코드 생성

                 @method _buildFlagOfCurrentTime
                 @return {String} HTML
                 @private
                 */
                _buildFlagOfCurrentTime: function () {
                    var mdate = moment(new Date()),
                        baseTime = mdate.clone().startOf('days');
                    var top = Math.ceil(mdate.diff(baseTime, 'minutes', true) / parseInt(1));

                    return ['<div id="current-timeline" class="real_time" style="top: ', top, 'px; left: 0px"></div>'].join("");
                },

                /**
                 입력시간에 대한 기준으로 부터 떨어진 거리 반환

                 @method _getSlotIndexByDate
                 @param {mixin} date Date 객체 혹은 시간 문자열
                 @return {Integer} offset 값
                 @private
                 */
                _getOffsetYByDate: function (date) {
                    var mdate = moment(date),
                        baseTime = mdate.clone().startOf('days');

                    return Math.ceil(mdate.diff(baseTime, 'minutes', true));
                },

                /**
                 타임라인뷰 컬럼 생성

                 @method _buildTimelineLabel
                 @return {String} HTML
                 @private
                 */
                _buileTimelineEventCols: function () {
                    var html = [],
                        matrix = this.matrix.getRowByDate(this.__range.from);

                    for (var _i = 0, len = matrix.length; _i < len; _i++) {
                        var _cur = matrix[_i],
                            _curDate = _cur.instance,
                            _fdate = moment(_curDate).format("YYYY-MM-DD"),
                            _events = _cur.events;

                        html.push(['<td', (isToday(_curDate) ? ' class = "today"' : ''), ' data-date="', _fdate, '"', '>'].join(""));
                        if (_events.length > 0) {
                            html.push('<div class="schedule_wrap" data-date="' + _fdate + '">');
                        }
                        html.push(this._buildScheduleTimeDiv(_events));
                        if (_events.length > 0) {
                            html.push('</div>');
                        }
                        html.push('</td>');
                    }
                    return html.join("\n");
                },

                /**
                 타임라인 일정 DIV 생성

                 @method _buildScheduleTimeDiv
                 @return {String} HTML
                 @private
                 */
                _buildScheduleTimeDiv: function (events) {
                    if (events.length < 1) return '';

                    var html = [],
                        timelineEvents = this._getTimelineEvents(events);

                    for (var _eventId in timelineEvents) {
                        var _event = timelineEvents[_eventId],
                            _evRef = _event._ref,
                            summary = _event.summary,
                            styleStr = '',
                            classes1 = ['schedule_time'];

                        var permission = _evRef.actions;
                        if (permission && permission.updatable) {
                            classes1.push('draggable');
                            if (!_.isUndefined(_evRef.endCid)) {
                                classes1.push('resizable');
                            }
                        }

                        // 넓이 계산
                        _event.width = this._getPercentageValue(100 / _event.concurrent, 'floor', 1);

                        // left 계산
                        _event.left = _event.hindex * _event.width;

                        // 넓이 재계산
                        _event.width = (_event.isLastIndex && _event.concurrent > _event.hindex) ? _event.width * (_event.concurrent - _event.hindex) : _event.width;

                        classes1.push(COLOR_CODE_PREFIX[SCHEDULE_TYPE.day] + _evRef.color);

                        // 위치 및 크기 지정 스타일
                        styleStr = ['top:', _event.top, 'px;', 'left:', _event.left, '%;', 'width:', _event.width, '%;', 'height:', _event.height, 'px'].join("");

                        html.push(
                            '<div class="', classes1.join(" "), '" style="', styleStr,
                            '" data-id="', _eventId, '" data-periodid="', _evRef.periodId, '" data-docid="', _evRef.docId,
                            '" data-startTime="', _evRef.startTime, '" data-endTime="', _evRef.endTime, '">', "\n");
                        html.push('<p class="head">');
                        html.push(buildTimeTextHtml(_evRef.startTime));
                        html.push('</p>');
                        html.push('<p class="content" title="', summary, ' ; ', '">', summary, '</p>');
                        if (permission && permission.updatable && !_.isUndefined(_evRef.endCid)) {
                            html.push('<div class="resize ui-resizable-handle ui-resizable-s"></div>');
                        }
                        html.push('</div>');
                    }
                    return html.join("");
                },

                /**
                 퍼센티지 숫자 반환(유틸)

                 @method _getPercentageValue
                 @return {Integer}
                 @private
                 */
                _getPercentageValue: function (rvalue, type, precision) {
                    precision = precision || 0;
                    type = type || 'round';
                    if ($.inArray(type, ['ceil', 'round', 'floor']) === -1) throw new Error("Illegal type.");

                    var _10pow = Math.pow(10, precision);
                    return Math[type].call(Math, rvalue * _10pow) / _10pow;
                },

                /**
                 입력시간에 대한 timeslot 인덱스 반환

                 @method _getSlotIndexByDate
                 @param {mixin} date Date 객체 혹은 시간 문자열
                 @return {Integer} timeslot index
                 @private
                 */
                _getSlotIndexByDate: function (date) {
                    return Math.ceil(this._getOffsetYByDate(date) / MINUTES_PER_TIMESLOT);
                },

                /**
                 타임라인 형식 일정 반환

                 @method _getTimelineEvents
                 @return {Integer}
                 @private
                 */
                _getTimelineEvents: function (events) {
                    var timelineEvents = {}, timeSlots = new Array(2 * 24);
                    // timeslots 에 넣기
                    for (var _i = 0, len = events.length; _i < len; _i++) {
                        if (!events[_i]) {
                            continue;
                        }

                        var _event = events[_i],
                            _evRef = _event._ref,
                            _sdt = moment(_evRef.startTime),
                            _msi = this._getSlotIndexByDate(_evRef.startTime),
                            _mei = this._getSlotIndexByDate(_evRef.endTime),
                            _diffIndex = _mei - _msi;

                        // 하루이내 시간 지정일정만 넣는다.
                        if (isScheduleDayType(_evRef, _event.range)) continue;

                        // 시간 일정은 top, height 는 미리 계산한다.
                        _event.top = (_sdt.hour() * 60) + _sdt.minute() - 1;
                        // 0분 일정은 30분 일정과 동일하게 표현한다.
                        _event.height = (_diffIndex === 0 ? 1 : _diffIndex) * HEIGHT_PER_TIMESLOT;
                        // 시간 일정만 저장하여 사용
                        timelineEvents[_event.id] = _event;

                        if (_diffIndex > 0) {
                            for (var _ti = _msi; _ti < _mei; _ti++) {
                                this._createTimeslot(timeSlots, _event.id, _ti);
                            }
                        } else {
                            this._createTimeslot(timeSlots, _event.id, _msi);
                        }
                    }
                    var maxConcurrent = 0;
                    // timeslots 돌아다니면서 계산
                    for (var _ti = 0, len = timeSlots.length; _ti < len; _ti++) {
                        // undefined 일 경우 건너뛴다.
                        if (!timeSlots[_ti]) continue;

                        var _len = timeSlots[_ti].length, _bitslots = [];

                        // _bitslots 초기화
                        for (var _bsi = 0; _bsi < _len; _bsi++) _bitslots[_bsi] = 0;

                        if (_len > 0) {
                            for (var _tj = 0; _tj < _len; _tj++) {
                                var _event = timelineEvents[timeSlots[_ti][_tj]];
                                if (maxConcurrent < _len) {
                                    maxConcurrent = _len;
                                }
                                if (typeof _event.hindex === 'undefined') {
                                    // 값이 0인 배열의 첫번째 index를 찾는다.
                                    _event.hindex = $.inArray(0, _bitslots);
                                }
                                _bitslots[_event.hindex] = _event.id;
                                if ((_event.hindex + 1) == _bitslots.length) {
                                    if (typeof _event.isLastIndex === 'undefined') {
                                        _event.isLastIndex = true;
                                    }
                                } else {
                                    _event.isLastIndex = false;
                                }
                            }
                        }
                    }
                    for (var _eventId in timelineEvents) {
                        var _event = timelineEvents[_eventId];
                        _event.concurrent = maxConcurrent;
                    }
                    return timelineEvents;
                },

                _createTimeslot: function (slots, eventId, index) {
                    if (!slots[index]) {
                        slots[index] = [];
                    }
                    slots[index].push(eventId);
                    return this;
                }
            };
            return Klass;
        })();

        /*
         * 일간 일정 뷰
         */
        var DailyView = (function () {
            // constructor
            var Klass = function (options) {
                // 기준일자를 이용하여 주 시작일자와 마지막 일자를 계산한다.
                var date = moment(options.date).clone(),
                    timlineView = new TimelineView(date);
                timlineView.setEvents(options.events);
                timlineView.setStartday(options.startday);

                this.timlineView = timlineView;
                this.options = options;
            };

            Klass.prototype.render = function () {
                this.timlineView.scrollTo(this.options.scrollTo);
                this.timlineView.render(this.options);
            };
            return Klass;
        })();

        /*
         * 주간 일정 뷰
         */
        var WeeklyView = (function () {
            // constructor
            var Klass = function (options) {
                // 기준일자를 이용하여 주 시작일자와 마지막 일자를 계산한다.
                var basedate = moment(options.date).clone(),
                    from = basedate.clone().day(0).add('days', options.startday),
                    to = basedate.clone().day(6).add('days', options.startday),
                    timlineView = new TimelineView(from, to);

                timlineView.setEvents(options.events);
                timlineView.setStartday(options.startday);

                this.timlineView = timlineView;
                this.options = options;
            };

            Klass.prototype.render = function () {
                this.timlineView.scrollTo(this.options.scrollTo);
                this.timlineView.render(this.options);
            };
            return Klass;
        })();

        /*
         * API
         */
        cb.getElement = function () {
            return $me;
        };

        cb.bind = cb.on = function () {
            var args = _slice.call(arguments);
            $.fn.on.apply($me, args);
        };

        cb.unbind = cb.off = function () {
            var args = _slice.call(arguments);
            $.fn.off.apply($me, args);
        };

        // 캘린더 높이 계산
        cb.resize = function (height) {
            $me.trigger(JS_CUSTOM_EVENTS.resize, [height]);
            return this;
        };

        // 일정뷰 타입 변경
        cb.changeViewType = function (type) {
            $me.trigger(JS_CUSTOM_EVENTS.change_view_type, [type]);
            return this;
        };

        // 조회일자 변경
        cb.changeDate = function (date, events) {
            $me.trigger(JS_CUSTOM_EVENTS.change_date, [date, events]);
            return this;
        };

        // 캘린더 색상 변경
        cb.updatePeriodColor = function (id, code) {
            $me.trigger(JS_CUSTOM_EVENTS.update_period_color, [id, code]);
            return this;
        };

        cb.resetEvents = function (events, scroll) {
            scroll = scroll || false;
            $me.trigger(JS_CUSTOM_EVENTS.reset_events, [events, scroll]);
            return this;
        };

        cb.render = function (events, opts) {
            if (options.lazy) render(events, opts);
        };

        // 뷰 렌더링 함수
        var render = function (events, opts) {
            // 추가 event 배열이 들어오면 일정 목록에 추가
            // lazy render 모드에서만 동작

            if (typeof events !== 'undefined' && events instanceof Array) {
                if (opts.clearOld && options.events.length > 0) {
                    options.events = events;
                } else {
                    options.events = options.events.concat(events);
                }
            }

            _.each(options.events, function (event) {
                if (_.isUndefined(event.endTime) || _.isNull(event.endTime)) {
                    event.endTime = event.startTime;
                } else if (_.isUndefined(event.startTime) || _.isNull(event.startTime)) {
                    event.startTime = event.endTime;
                }
            });
            $.extend(true, options, opts || {});
            // 이벤트 시작시간 순 정렬
            sortEvents();

            switch (options.type) {
                case VIEW_TYPE.d:
                    (new DailyView(options)).render();
                    break;
                case VIEW_TYPE.w:
                    (new WeeklyView(options)).render();
                    break;
                case VIEW_TYPE.m:
                    (new MonthlyView(options)).render();
                    break;
                default:
                    return new Error("Illegal view type");
                    break;
            }
        };

        // 메인 구동 함수
        var run = function () {
            init();
            if (!options.lazy) render();
        };

        // 메인 프로그램 구동
        run();
        return cb;
    };
}).call(this, jQuery, moment);