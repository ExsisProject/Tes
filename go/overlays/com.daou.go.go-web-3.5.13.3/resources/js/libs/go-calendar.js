﻿(function (name, definition, $, _, moment, undefined) {

    var
        theModule = definition(),
        hasDefine = typeof define === 'function' && define.amd,
        hasExports = typeof module !== 'undefined' && module.exports;

    if (hasDefine) {
        define(theModule);
    } else if (hasExports) {
        module.exports = theModule;
    } else {
        var obj = null,
            namespaces = name.split("."),
            scope = this;

        for (var i = 0, len = namespaces.length; i < len; i++) {
            var packageName = namespaces[i];

            if (obj && i == len - 1) {
                obj[packageName] = theModule;
            } else if (typeof scope[packageName] === "undefined") {
                scope[packageName] = {};
            }

            obj = scope[packageName];
        }
    }

})('GO.Calendar', function () {

    var Util,
        Language,
        SimpleAddEventLayer,

        // jQuery.noConflict 모드에서도 사용할 수 있도록 로컬 변수로 등록해준다.
        $ = window.$ || jQuery;

    function hasGORouter() {
        return !!window.Backbone && GO.hasOwnProperty('router');
    }

    Util = (function () {
        var _slice = Array.prototype.slice;

        return {
            fixedUrl: function (str) {
                return str.replace('//', '/');
            },

            fixLocaleCode: function (locale) {
                if (locale === 'jp') return 'ja';
                return locale;
            },

            navigate: function (url, options, contextRoot) {
                contextRoot = contextRoot || '/';

                var opts = $.extend({}, {trigger: true, replace: false}, options || {});

                // GO 시스템하에서는 GO.router.navigate 호출
                if (hasGORouter()) {
                    GO.router.navigate(url, opts);
                } else {
                    if (window.opener) {
                        if (opts.replace) {
                            location.replace(url);
                        } else {
                            location.assign(url);
                        }
                    } else {
                        if (opts.replace) {
                            window.top.window.location.replace(url);
                        } else {
                            window.top.window.location.assign(url);
                        }
                    }
                }
            },

            isSupportHistoryAPI: function () {
                return !!(window.history && history.pushState);
            },

            hourMinute: function (datetime, locale) {
                return this.formatDatetime(datetime, locale, "HH:mm");
            },

            formatDatetime: function (datetime, locale, pattern) {
                return this.toMoment(datetime).format(pattern);
            },

            toMoment: function () {
                var args = _slice.call(arguments),
                    datetime = args[0];
                if (!moment.isMoment(datetime)) {
                    if (!moment.apply(moment, args).isValid()) throw new Error("Invalid Date Format");
                    datetime = moment.apply(moment, args);
				};
                return datetime;
            },

            isSameDate: function (date1, date2) {
                var _d1 = this.toMoment(date1).clone().startOf('days'),
                    _d2 = this.toMoment(date2).clone().startOf('days');
                return Math.floor(_d1.diff(_d2)) === 0;
            },
        };
    })();

    Language = (function () {
        var DEFAULT_LANGS = {
            "내 캘린더": "내 캘린더",
            "일정 등록": "일정 등록",
            "일정명": "일정명",
            "일시": "일시",
            "시간": "시간",
            "분": "분",
            "종일": "종일",
            "확인": "확인",
            "취소": "취소",
            "일정상세 입력": "일정상세 입력",
            "기본 캘린더 이름": "{{username}}의 일정",
            "기본 캘린더 표시": "(기본)",
            "장소": "장소",
            "전사일정": "전사일정",
            "알림메일 확인": "알림메일 확인",
            "일정등록에 대한 알림메일을 보내시겠습니까?": "일정등록에 대한 알림메일을 보내시겠습니까?",
            "보내기": "보내기",
            "보내지 않음": "보내지 않음"
        };

        function Klass(langs) {
            this.languages = _.defaults(langs || {}, DEFAULT_LANGS);
        }

        Klass.prototype.set = function (key, val) {
            if ($.isPlainObject(key)) {
                $.extend(true, this.languages, key);
            } else {
                this.languages[key] = val;
            }
        };

        Klass.prototype.get = function (key) {
            return _.isUndefined(key) ? this.languages : this.languages[key];
        };

        return Klass;
    })();

    SimpleAddEventLayer = (function (Util, Language) {
        var DEFAULT_STEP_MINUTES = 30;
        var NOW = moment(),
            FORMAT_DATETIME = "YYYY-MM-DD HH:mm",
            DATE_FORMAT_YMD = "YYYY-MM-DD",
            DATE_FORMAT_HM = "HH:mm",
            DEFAULT_WIDTH = 620,
            SUMMARY_MAX_LENGTH = 500,
            ONE_MINUTE_TO_SECOND = 60;


        function Klass(options) {
            NOW = moment();

            // 옵션 원본 저장
            this.options = options;

            this.contextRoot = options.contextRoot || '/';
            this.session = options.session || {};

            this.calendarId = options.calendarId;
            this.location = options.location || "";
            this.summary = options.summary || '';
            // timeType option : timed or allday
            this.timeType = options.timeType || "timed";
            this.type = options.type || "normal";
            this.visibility = options.visibility || "public";
            this.startDate = options.startDate || NOW.format(DATE_FORMAT_YMD);
            this.endDate = options.endDate || this.startDate;
            this.startTime = options.startTime || getIntervalTime().format(DATE_FORMAT_HM);
            this.endTime = options.endTime || getIntervalTime().add('hours', 1).format(DATE_FORMAT_HM);
			this.afterAddEvent = options.afterAddEvent || function() {};
			this.onCreateError = options.onCreateError || function() {};
            this.modal = options.modal || false;
            this.width = options.width || DEFAULT_WIDTH;
            // 옵션에 따라 일정 등록 여부 결정
            // CalendarEvent(calendar/models/event) 객체를 리턴 처리
            // 해당 파라미터가 없을 경우 항상 Calendar Format으로 리턴함
            // Parameter > calendar : true, related : false
            if (options.returnType == 'related') {
                this.returnType = false;
            } else {
                this.returnType = true;
            }
            this._sdate = moment(this.startDate + 'T' + this.startTime + ':00');
            this._edate = moment(this.endDate + 'T' + this.endTime + ':00')

            this.lang = new Language(options.lang || {});

			this.afterChangeCallbacks = $.Callbacks();
			this.el = options.el;
			this.submitFlag = false;
			this.changeEvent = options.changeEvent;
		}

        Klass.prototype.open = function () {
            var self = this;
            this.preloader = null;
            if($ && $.goPreloader) {
                this.preloader = $.goPreloader();
                this.preloader.render();
            }

            popupInit.call(this).then(function (popup) {
                popup.addClass("layer_calendar_speed");
                attachDatepicker.call(self, popup);
                buildTimeOptions.call(self, popup);
                buildMyCalendarOptions.call(self, popup);
                delegateEvents.call(self, popup);
            });
        };

        Klass.prototype.init = function () {
            attachDatepicker.call(this, this.el);
            buildTimeOptions.call(this, this.el);
            delegateEvents.call(this, this.el);
        };

        Klass.prototype.afterChanged = function (callback) {
            this.afterChangeCallbacks.add(callback);
        };

        Klass.prototype.getCurrentTimeInfo = function () {
            var $endDate = $("#endDate");
            var endDate = $endDate.length ? $endDate.val() : $("#startDate").val();
            return {
                "startTime": $("#startDate").val() + 'T' + $("#startTime").val() + ':00',
                "endTime": endDate + 'T' + $("#endTime").val() + ':00'
            };
        };

        Klass.prototype.updateSelectedTime = function (startTime, endTime) {
            var newStartTime = getIntervalTime(startTime, DEFAULT_STEP_MINUTES);
            if (typeof endTime === 'undefined') {
                endTime = newStartTime.clone().add('hours', 1);
            }

            $("#startTime").attr("data-prev", newStartTime.format(DATE_FORMAT_HM));
            buildTimeOptions.call(this, this.el);

            return this;
        };

        Klass.prototype.reset = function (opt) {
            $("#startDate").val(opt.startDate);
            $("#startTime").val(opt.startTime);
            $("#endDate").val(opt.endDate);
            $("#endTime").val(opt.endTime);

            $("#startDate").attr('data-prev', opt.startDate);
            $("#startTime").attr('data-prev', opt.startTime);
            $("#endDate").attr('data-prev', opt.endDate);
            $("#endTime").attr('data-prev', opt.endTime);
        };

		Klass.prototype.updatePrevDate = function (option) {
			_setStartDate.call(this, option.prevStartDate);
			_setEndDate.call(this, option.prevEndDate);
		};
		// Privates
		function buildMyCalendarOptions(popup) {
			var self = this,
				reqUrl = this.contextRoot + 'api/calendar/user/' + this.session.id + '/calendar';

            $.ajax(reqUrl).then(function (resp) {

                var myBuff = [],
                    companyBuff = [],
                    myCalendars = _.filter(resp.data || [], function (calendar) {
                        return calendar.type === 'normal';
                    }),
                    companyCalendars = _.filter(resp.data || [], function (calendar) {
                        return (calendar.type === 'company' && calendar.permission == true);
                    });

                // 전사 일정이 존재할 경우에는 전사 일정 노출
                if (companyCalendars.length > 0) {
                    $(popup).find('#company_calendar').closest('tr').show();

                    _.each(companyCalendars, function (calendar, i) {
                        companyBuff.push(
                            '<option value="', calendar.id, '">',
                            calendar.name,
                            '</option>'
                        );
                    }, self);

                    $(popup).find('select[name=companyId]')
                        .empty()
                        .append(companyBuff.join(""));
                }

                _.each(myCalendars, function (calendar, i) {
                    myBuff.push(
                        '<option value="', calendar.id, '"', calendar.defaultCalendar ? 'selected' : '', '>',
                        calendar.defaultCalendar ? this.lang.get('기본 캘린더 표시') : '',
                        calendar.name || buildDefaultCalendarName.call(this, calendar.owner.name),
                        '</option>'
                    );
                }, self);

                if (self.type) {
                    if (self.type == "company") {
                        $(popup).find("input[name=companyType]").click();
                    }
                }

                $(popup).find('select[name=calendarId]')
                    .empty()
                    .append(myBuff.join(""));


                if (self.calendarId) {
                    $(popup).find('select[name=calendarId]').val(self.calendarId);
                }


                if (self.timeType == 'allday') {
                    $(popup).find("input[name=timeType]").click();
                }
            }).always(function() {
                if(self.preloader) {
                    self.preloader.release();
                }
            });
        }

        function buildDefaultCalendarName(username) {
            var tpl = this.lang.get('기본 캘린더 이름');
            tpl.replace(/\{\{username\}\}/, username);

            return tpl;
        }

        function attachDatepicker(layerEl) {
            layerEl.find('#startDate').datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onClose: _.bind(function (selectedDate) {
                    changeStartDate.call(this, selectedDate);
                    this.el.trigger("calendarDate:change");
                }, this)
            });
            layerEl.find('#endDate').datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onClose: _.bind(function (selectedDate) {
                    changeEndDate.call(this, selectedDate);
                    this.el.trigger("calendarDate:change");
                }, this),
                minDate: this.startDate
            });
        }

        function processDateConstraint() {
            // event callback 함수의 마지막에서 sync 처리를 하므로 selector 를 통해 값 추출.
            var valueOfStartDate = $("#startDate").val();
            // layer 에서는 endDate 가 존재하지 않음.
            var valueOfEndDate = $("#endDate").length ? $("#endDate").val() : $("#startDate").val();
            var prevStartDate = $("#startDate").attr("data-prev");
            var maxStartDate = '';
            var changedEndtime = null;

            if (valueOfEndDate) {
                var startDatetime = moment(valueOfStartDate + " " + $("#startTime").val(), FORMAT_DATETIME);
                var prevStartDatetime = moment(prevStartDate + " " + $("#startTime").attr('data-prev'), FORMAT_DATETIME);
                var endDatetime = moment(valueOfEndDate + " " + $("#endTime").val(), FORMAT_DATETIME);
                var diffMinutes = endDatetime.diff(prevStartDatetime, 'minutes');

                if (diffMinutes < ONE_MINUTE_TO_SECOND) {
                    changedEndtime = startDatetime.clone().add('minutes', diffMinutes);
                    maxStartDate = changedEndtime.format(DATE_FORMAT_YMD);
                } else {
                    maxStartDate = moment(valueOfEndDate).format(DATE_FORMAT_YMD);
                }
            } else {
                maxStartDate = moment(valueOfStartDate).format(DATE_FORMAT_YMD);
            }

            // 종료일자 변경
            $(this.el).find('#endDate').datepicker('setDate', maxStartDate);
            $("#endTimeList").empty();
            buildTimeOptions.call(this, this.el, changedEndtime);
            // 종료일자 minDate 옵션 변경
            $(this.el).find('#endDate').datepicker('option', 'minDate', valueOfStartDate);
            // 종료일정 동기화 처리
            _setEndDate.call(this, $("#endDate").val());

            return this;
        }

		function changeStartDate(datestr) {
			var option = {
				isDateDiff: $("#endDate").val() !== $("#startDate").val(),
				prevStartDate: this.startDate,
				prevEndDate: this.endDate
			};

			_setStartDate.call(this, $("#startDate").val());
			processDateConstraint.call(this);
			this.afterChangeCallbacks.fire();
			if(this.changeEvent) this.changeEvent(option);
		}

		function changeEndDate(selectedDate) {
			var option = {
				isDateDiff: $("#endDate").val() !== $("#startDate").val(),
				prevStartDate: this.startDate,
				prevEndDate: this.endDate
			};

			var selectedDatetime = moment(selectedDate + " " + this.endTime, FORMAT_DATETIME);
			$("#startTimeList").empty();
			$("#endTimeList").empty();
			buildTimeOptions.call(this, this.el, selectedDatetime);
			if (_isInvalidTime()) {
				_setValidTime.call(this);
				this.afterChangeCallbacks.fire();
				return;
			}
			_setEndDate.call(this, selectedDate);
			this.afterChangeCallbacks.fire();
			if(this.changeEvent) this.changeEvent(option);
		}


        function popupInit(options) {
            var defer = $.Deferred(),
                popupOptions,
                buttonType = [];

            if (this.returnType) {
                buttonType = [buildDetailButton.call(this), buildRegistButton.call(this), {
                    btext: this.lang.get("취소"),
                    btype: 'cancel'
                }];
            } else {
                buttonType = [buildRegistButton.call(this), {
                    btext: this.lang.get("취소"),
                    btype: 'cancel'
                }];
            }

            popupOptions = {
                "header": this.lang.get("일정 등록"),
                "modal": this.modal,
                "width": this.width,
                "contents": buildLayerTpl.call(this),
                "buttons": buttonType,
                closeCallback: function (e) {
                    $('.ui-droppable').removeClass("conti_schedule");
                }
            };

            if (!this.modal && this.options.hasOwnProperty('offset')) {
                popupOptions.offset = this.options.offset;
            }

            this.el = $.goPopup(popupOptions);

            defer.resolve(fixPosition(this.el));
            return defer;
        }

        function fixPosition(popup) {
            var offset = popup.offset(),
                pW = popup.outerWidth(),
                pH = popup.outerHeight(),
                fL = offset.left + pW,
                fT = offset.top + pH,
                winW = $(window).width(),
                winH = $(window).height();

            if (fL > winW) {
                popup.css("left", winW - pW - 10);
            }

            if (fT > winH) {
                popup.css("top", winH - pH - 10);
            }

            return popup;
        }

        function buildTimeOptions(layerEl) {
            $(layerEl)
                .find('#startTimeList')
                .empty().append(buildStartTimeOption.call(this, this.startTime)).end()
                .find('#endTimeList')
                .empty().append(buildEndTimeOption.call(this, this.startTime)).end();
            $(layerEl).find("#startTime").val(this.startTime);
            $(layerEl).find("#endTime").val(this.endTime);


        }

        function delegateEvents(layerEl) {
            $(layerEl)
                .on('submit', 'form[name=f_regist_event]', _.bind(_preventDefaultSubmit, this))
                .on('click', 'input[name="timeType"]', _.bind(_changeTimeType, this))
                .on('click', 'input[name="companyType"]', _.bind(_changeCompanyType, this))
                .on('click', '#startTime', _.bind(_showTimeList, this))
                .on('click', '#endTime', _.bind(_showTimeList, this))
                .on('click', '#startTimeList li', _.bind(_selectTime, this))
                .on('click', '#endTimeList li', _.bind(_selectTime, this))
                .on('keydown', '#startTime', _.bind(_enterTime, this))
                .on('keydown', '#endTime', _.bind(_enterTime, this))
                .on('change', '#startTime', _.bind(_changeStartTime, this))
                .on('change', '#endTime', _.bind(_changeEndTime, this));

            var typeConverter = {
                start: "end",
                end: "start"
            };
            $(document).off("click.outside-calendar");
            $(document).on("click.outside-calendar", function (e) {
                var targetType = $(e.target).attr("data-outside");
                if (targetType == undefined) {
                    changeTime();
                    _hideTimeList();
                } else {
                    _hideTimeList(typeConverter[targetType]);
                }
            });
        }


        function changeTime() {
            var startTimeEl = $("#startTime");
            var emdTimeEl = $("#endTime");
            startTimeEl.val(_parseTime(startTimeEl.val()));
            emdTimeEl.val(_parseTime(emdTimeEl.val()));
        }


        function _parseToInteger(time) {
            return parseInt(time.split(":").join(""));
        }


        function _enterTime(e) {
            if (e.keyCode && e.keyCode != 13) return;
            e.preventDefault();
            var type = _getTimeType(e);
            var target = $(e.currentTarget);
            var time = target.val();

            $("#" + type + "TimeList").hide();

            target.val(_parseTime(time));
            target.attr("data-prev", _parseTime(time));

            target.trigger("change");
        }


        function _hideTimeList(type) {
            if (type) {
                $("#" + type + "TimeList").hide();
            } else {
                $("#startTimeList").hide();
                $("#endTimeList").hide();
            }
        }


        function _showTimeList(e) {
            var type = _getTimeType(e);
            var list = $("#" + type + "TimeList");
            var input = $("#" + type + "Time");
            list.show();
            if (type == "start") {
                list.scrollTop(0);
                var position = list.find("li[data-value='" + input.val() + "']").position();
                var top = position ? position.top : 0;
                list.scrollTop(top);
            }
        }


        function _selectTime(e) {
            var target = $(e.currentTarget);
            var type = target.parent().attr("data-type");
            var time = target.text();
            var input = $("#" + type + "Time");

            $("#" + type + "TimeList").hide();

//        	_setTime.call(this, type, time);
            input.val(_parseTime(time));
            input.attr("data-prev", _parseTime(time));

            input.trigger("change");
        }


        function _parseTime(time) {
            if (!time) return "";

            var pattern = /[^(0-9)]/gi;
            time = time.replace(pattern, "");
            time = time.substr(0, 4);
            var first = time.substr(0, 1);

            if (parseInt(first) > 2) time = "0" + time.substr(0, 3);

            var parsedTime = time;
            var firstHalf = parsedTime.substr(0, 2);
            var secondHalf = parsedTime.substr(2, 2);

            if (secondHalf.length == 0) secondHalf = "00";
            if (secondHalf.length == 1) secondHalf = "0" + secondHalf;

            var isValid = parseInt(firstHalf) <= 23 && parseInt(firstHalf) >= 0 && parseInt(secondHalf) <= 59 && parseInt(secondHalf) >= 0;

            if (isValid) {
                parsedTime = firstHalf + ":" + secondHalf;
            } else {
                parsedTime = Util.hourMinute();
            }

            return parsedTime;
        }


        function _getTimeType(e) {
            var target = $(e.currentTarget);
            var type = target.attr("id") == "startTime" ? "start" : "end";

            return type;
        }


        function _preventDefaultSubmit(e) {
            e.preventDefault();
        }

        function _changeTimeType(e) {
            var dateWrap = $(e.delegateTarget).find('.wrap-selecttime');

            if ($(e.currentTarget).is(":checked")) {
                dateWrap.hide();
            } else {
                dateWrap.show();
            }
        }

        function _changeCompanyType(e) {
            var dateWrap = $(e.delegateTarget).find('#compnay_event_list');
            var myCalendar = $(e.delegateTarget).find('#my_calendar').closest('tr');

            if ($(e.currentTarget).is(":checked")) {
                dateWrap.show();
                myCalendar.hide();
            } else {
                dateWrap.hide();
                myCalendar.show();
            }
        }

        function _changeStartTime(e) {
            var startTime = _parseTime($("#startTime").val());
            var tsdate = moment(this._sdate.format('YYYY-MM-DDT') + startTime + ':00');
            var cdur = this._edate.diff(this._sdate, "minutes", true);
            var newEndDate = moment(tsdate).add("minutes", cdur);

            _setStartTime.call(this, startTime);

            $(e.delegateTarget).find('#startTimeList')
                .empty()
                .append(buildStartTimeOption.call(this, startTime));

            $(e.delegateTarget).find('#endTimeList')
                .empty()
                .append(buildEndTimeOption.call(this, startTime));
            $("#endTime").removeClass("error");

            var newEndDateTime = newEndDate.format("HH:mm");
            var startDate = $("#startDate").val();
            var endDate = $("#endDate").val();

            _setEndTime.call(this, newEndDateTime);

            if (startDate == endDate && newEndDateTime < startTime) {
                _setEndDate(newEndDate.format('YYYY-MM-DD'));
            }


			this.afterChangeCallbacks.fire();
			if(this.changeEvent) this.changeEvent(false);
		}

        function _changeEndTime(e) {
            if (_isInvalidTime()) {
                _setValidTime.call(this);
                return;
            }

            _setEndTime.call(this, _parseTime($("#endTime").val()));

			this.afterChangeCallbacks.fire();
			if(this.changeEvent) this.changeEvent(false);
		}

        function _isInvalidTime() {
            var startDate = $("#startDate").val();
            var endDate = $("#endDate").val() || startDate;
            var startTime = $("#startTime").val();
            var endTime = $("#endTime").val();
            var parsedStartTime = _parseTime(startTime);
            var parsedEndTime = _parseTime(endTime);
            var momentStartTime = moment(startDate + "T" + parsedStartTime + ":00");
            var momentEndTime = moment(endDate + "T" + parsedEndTime + ":00");

            return momentStartTime > momentEndTime;
        }

        function showErrorMsg(target, msg) {
            $.goError(msg, target);
            target.addClass('enter error').focus();
        }

        function buildStartTimeOption(timestr) {
            var step = 30;
            var cursorTime = moment().startOf('days');
            var length = 60 / step * 24;
            var html = [];
            var term = 0;

            if (typeof timestr === "string") {
                term = timestr.split(":")[1];
            }

            cursorTime.add("minutes", parseInt(term));
            for (var i = 0; i < length; i++) {
                var ftime = cursorTime.format("HH:mm");
                html.push('<li data-value="' + ftime + '">' + ftime + '</li>');
                cursorTime.add('minutes', step);
            }

            return html.join("\n");
        }

        function buildEndTimeOption(selectedDate) {
            var timeOpts = [];
            var startDate = $("#startDate").val();
            // startTime el 에 값이 세팅되기 전에는 this.startTime 값을 사용하여도 무방.
            var startTime = $("#startTime").val() || this.startTime;
            var startDatetime = moment(startDate + " " + startTime, FORMAT_DATETIME);
            // layer 에서는 endDate 가 존재하지 않음.
            var endDate = $("#endDate").length ? $("#endDate").val() : $("#startDate").val();
            var isSameDate = Util.isSameDate(startDate, endDate);
            var selectedTime = selectedDate;
            var timeslots = buildTimeSlots.call(this, selectedTime);

            for (var i = 0, len = timeslots.length; i < len; i++) {
                var curTime = timeslots[i].time;
                var endDatetime = moment(endDate + " " + curTime, FORMAT_DATETIME);
                var diffHours = Math.floor(endDatetime.diff(startDatetime, 'hours', true) * 10) / 10;
                var duration = null;
                var disabled = false;

                if (isSameDate && (diffHours >= 0 && diffHours < 1)) {
                    duration = '(' + diffHours * 60 + this.lang.get("분") + ')';
                }
                if (isSameDate && diffHours >= 1) {
                    duration = '(' + diffHours + this.lang.get("시간") + ')';
                }
                if (isSameDate && diffHours < 0) {
                    disabled = true;
                }
                if (disabled) {
                    continue;
                }

                var markup = compileOptionTimeTpl().render({
                    "option_value": curTime,
                    "option_label": curTime,
                    "duration": duration
                });

                timeOpts.push(markup);

                if (selectedTime === curTime) {
                    $("#endTime").val(selectedTime);
                }
            }

            return timeOpts.join("\n");
        }

        function buildTimeSlots(selectedTime) {
            var cursorTime = NOW.startOf('days');
            var timeslots = new Array(60 / DEFAULT_STEP_MINUTES * 24);
            var term = parseInt(selectedTime.split(":")[1]) % 30;
            cursorTime.add("minutes", parseInt(term));

            for (var i = 0, len = timeslots.length; i < len; i++) {
                timeslots[i] = {"time": cursorTime.format(DATE_FORMAT_HM)};
                cursorTime.add('minutes', DEFAULT_STEP_MINUTES);
            }

            if (!_.where(timeslots, {"time": selectedTime}).length) {
                timeslots.push({"time": selectedTime});
                timeslots = _.sortBy(timeslots, function (obj) {
                    return parseInt(('' + obj.time).replace(":", ""));
                });
            }

            return timeslots;
        }

        function compileOptionTimeTpl() {
            var html = [];
            html.push('<li data-value="{{option_label}}" data-outside><span class="txt" data-outside>');
            html.push('{{option_label}}{{duration}}');
            html.push('</span></li>');

            return Hogan.compile(html.join("\n"));
        }

        function buildDetailButton() {
            return {
                "btext": this.lang.get("일정상세 입력"),
                "btype": 'confirm',
                "callback": _.bind(function (el) {
                    var search = [];
                    var curTimeType = el.find('input[name=timeType]:checked').val() || this.timeType;
                    var calendarType = el.find('input[name="companyType"]:checked').val() || 'public';
                    var summary = el.find('input[name=summary]').val();
                    var calendarId = el.find('select[name=calendarId]').val();
                    var reqUrl = "calendar/regist";
                    var sdate = this._sdate;
                    var edate = this._edate;

                    if (!hasGORouter()) {
                        reqUrl = Util.fixedUrl(this.contextRoot + '/app/' + reqUrl);
                    }

                    if (!!summary) {
                        search.push("summary=" + encodeURIComponent(summary));
                    }

                    if (calendarType == "company") {
                        calendarId = el.find('select[name=companyId]').val();
                    }

                    search.push("calendar=" + calendarId);
                    search.push("tt=" + curTimeType);
                    search.push("ct=" + calendarType);
                    search.push("sd=" + sdate.format('YYYY-MM-DD'));
                    search.push("ed=" + edate.format('YYYY-MM-DD'));
                    search.push("location=" + el.find("input[name=location]").val());

                    if (curTimeType === 'timed') {
                        search.push("st=" + el.find('#startTime').val());
                        search.push("et=" + el.find('#endTime').val());
                    }

                    Util.navigate([reqUrl, search.join("&")].join("?"), {trigger: true, pushState: true});
                }, this)
            };
        }

        function buildRegistButton() {
            return {
                "btext": this.lang.get("확인"),
                "btype": 'confirm',
                "autoclose": false,
                "callback": _.bind(function (el) {
                    var self = this;
                    var $el = $(el);
                    var currentTime = this.getCurrentTimeInfo();
                    var sdate = moment(currentTime.startTime);
                    var edate = moment(currentTime.endTime);
                    var attendees = [];
                    var validateResult = isInvalidateRegistEvent($(el));
                    var timeType = $el.find('input[name=timeType]:checked').val() || 'timed';
                    var calendarType = $el.find('input[name="companyType"]:checked').val() || 'public';
                    // 종일일정일 경우 타임 포멧 변경함
                    if (timeType === 'allday') {
                        var startDate = $el.find('input[name=start_date]').val();
                        var endDate = $el.find('input[name=end_date]').val();
                        sdate = moment(startDate, "YYYY-MM-DD").clone().startOf("day");
                        edate = moment(endDate, "YYYY-MM-DD").clone().endOf("day");
                    }

					// 주의: 결과가 false가 아니면 통과하지 못한 것임.
					if(validateResult) {
						self.onCreateError(validateResult);
						return false;
					}

                    if (this.submitFlag) {
                        return false;
                    }
                    this.submitFlag = true;
                    var calendarId, type;
                    // 개인 일정 등록시
                    if (calendarType == "company") {
                        type = "company";
                        calendarId = parseInt($(el).find("select[name=companyId]").val());
                    } else {
                        type = "normal";
                        calendarId = parseInt($(el).find("select[name=calendarId]").val());
                        attendees.push({"id": this.session.id});
                    }

                    var format = "YYYY-MM-DDTHH:mm:ss.SSSZ";
                    if (timeType === 'allday') {
                        format = "YYYY-MM-DDTHH:mm:ss.SSS" + this.session.serverTZOffset;
                    }

                    // GO-26748 XSS 대응
                    var summary = $el.find('input[name=summary]').val();
                    if (GO.util.isXSSPettern(summary)) {
                        summary = GO.util.escapeXssToBlank(summary);
                    }

                    var enrollmentData = {
                        "type": type,
                        "calendarId": calendarId,
                        "attendees": attendees,
                        "timeType": timeType,
                        "summary": summary,
                        "startTime": sdate.format(format),
                        "endTime": edate.format(format),
                        "visibility": 'public',
                        "timeZoneOffset": moment(new Date()).format("Z"), // mail 측에서도 공통으로 사용하여 GO.util 사용 불가
                        "location": $el.find('input[name=location]').val()
                    };

                    if (calendarType == "company") {
                        confirmNoti.call(this, enrollmentData).done(function () {
                            registEvent.call(self, el, enrollmentData, calendarId);
                        });
                    } else {
                        registEvent.call(this, el, enrollmentData, calendarId);
                    }

                }, this)
            };
        }

        function confirmNoti(enrollmentData) {
            var self = this;
            var deferred = $.Deferred();

            $.goPopup({
                allowPrevPopup: true,
                modal: false,
                title: self.lang.get("알림메일 확인"),
                message: self.lang.get("일정등록에 대한 알림메일을 보내시겠습니까?"),
                buttons: [{
                    btext: self.lang.get("보내기"),
                    btype: "confirm",
                    callback: function () {
                        $.extend(enrollmentData, {mailNoti: true});
                        deferred.resolve();
                    }
                }, {
                    btext: self.lang.get("보내지 않음"),
                    btype: "normal",
                    callback: function () {
                        $.extend(enrollmentData, {mailNoti: false});
                        deferred.resolve();
                    }
                }],
                closeCallback: function () {
                    self.submitFlag = false;
                }
            });

            return deferred;
        }

        function registEvent(el, enrollmentData, calendarId) {
            var self = this;
            if (self.returnType) {
                $.ajax({
                    "url": self.contextRoot + 'api/calendar/' + calendarId + '/event',
                    "type": 'POST',
                    "contentType": 'application/json',
                    "data": JSON.stringify(enrollmentData)
                }).done(function (resp) {
                    el.close();
                    self.afterAddEvent(resp.data);
                }).error(function () {
                    self.onCreateError();
                }).always(function () {
                    self.submitFlag = false;
                });
            } else {
                el.close();
                self.afterAddEvent(enrollmentData);
            }
        }

        function isInvalidateRegistEvent($form) {
            var summary = $form.find('input[name=summary]').val(),
                calendarId = $form.find("select[name=calendarId]").val();

            if (!summary) {
                return 'required:summary';
            }

            if (summary.length > SUMMARY_MAX_LENGTH) {
                return 'max:summary';
            }

            if (!calendarId) {
                return 'required:calendarId';
            }

            return false;
        }

        function buildLayerTpl() {
            var html = [];

            html.push('<form name="f_regist_event">');
            html.push('<fieldset>');
            html.push('<table class="form_type go_renew">');
            html.push('<tbody>');
            html.push('<tr>');
            html.push('<th><span class="title">' + this.lang.get("일정명") + '<ins class="asterisk">*</ins></span></span></th>');
            html.push('<td><div class="wrap_txt w_max"><input class="txt_mini w_max" type="text" name="summary" value="' + this.summary + '"maxlength="500"></div></td>');
            html.push('</tr>');
            html.push('<tr>');
            html.push('<th><span class="title">' + this.lang.get("일시") + '</span></th>');
            html.push('<td>');

            html.push('<span class="wrap_date">');
            html.push('<input id="startDate" class="start-date txt wfix_small" type="text" name="start_date" value="' + this.startDate + '" readonly="readonly">');
            html.push('<span class="ic ic_calendar"></span>');
            html.push('</span>');

            html.push('<span class="wrap_multiselect wrap-selecttime">');
            html.push('<span class="wrap_select">');
            html.push('<span class="wrap_select_list">');
            html.push('<input id="startTime" name="start_time" type="text" class="txt wfix_small" data-outside="start">');
            html.push('<ul id="startTimeList" data-type="start" class="select_list" style="display:none" data-outside="start">');
            html.push('</ul>');
            html.push('</span>');
            html.push('</span>');
            html.push('</span>');
            html.push('<span class="date_wave">~</span>');
            html.push('<span class="wrap_date">');
            html.push('<input id="endDate" class="end-date txt wfix_small" type="text" name="end_date" value="' + this.endDate + '" readonly="readonly">');
            html.push('<span class="ic ic_calendar"></span>');
            html.push('</span>');
            html.push('<span class="wrap_multiselect wrap-selecttime">');
            html.push('<span class="wrap_select">');
            html.push('<span class="wrap_select_list">');
            html.push('<input id="endTime" name="end_time" type="text" class="txt wfix_normal" data-outside="end">');
            html.push('<ul id="endTimeList" data-type="end" class="select_list" style="display:none" data-outside="end">');
            html.push('</ul>');
            html.push('</span>');
            html.push('</span>');
            html.push('</span>');

            html.push('<span class="horspace1"></span>');
            html.push('<span class="wrap_option"><input id="checkbox-allday" type="checkbox" name="timeType" value="allday"><label for="checkbox-allday">' + this.lang.get("종일") + '</label></span>');
            html.push('</td>');
            html.push('</tr>');
            html.push('<tr style="display:none;">');
            html.push('<th><span id="company_calendar" class="title">' + this.lang.get("전사일정") + '</span></th>');
            html.push('<td>');
            html.push('<span class="wrap_option"><input id="checkbox-company" type="checkbox" name="companyType" value="company"><label for="checkbox-company">' + this.lang.get("전사일정") + '</label></span><br>');
            html.push('<span id="compnay_event_list" class="wrap_multiselect" style="display: none;">');
            html.push('<span class="wrap_select"><select name="companyId"></select></span>');
            html.push('</span>');
            html.push('</td>');
            html.push('</tr>');
            html.push('<tr>');
            html.push('<th><span id="my_calendar" class="title">' + this.lang.get("내 캘린더") + '</span></th>');
            html.push('<td class="">');
            html.push('<span class="wrap_multiselect">');
            html.push('<span class="wrap_select"><select name="calendarId"></select></span>');
            html.push('</span>');
            html.push('</td>');
            html.push('</tr>');

            html.push('<tr>');
            html.push('<th><span class="title">' + this.lang.get("장소") + '</span></th>');
            html.push('<td><div class="wrap_txt w_max"><input class="txt_mini w_max" type="text" name="location" value="' + this.location + '"maxlength="500"></div></td>');
            html.push('</tr>');

            html.push('</tbody>');
            html.push('</table>');
            html.push('</fieldset>');
            html.push('</form>');

            return html.join("\n");
        }

        function getIntervalTime(datetime, interval) {
            var mDate = moment(datetime || new Date),
                mbasedate = mDate.isSame(new Date, 'day') ? mDate : mDate.clone().startOf('day'),
                baseSec = 60 * (interval || 30);

            return moment((Math.ceil(Math.floor(mbasedate.valueOf() / 1000) / baseSec) * baseSec) * 1000);
        }

        /**
         * 아래 함수들은 event callback 함수에서만 사용하도록 하자.
         * callback 함수 내부에서 가장 마지막 라인에서 처리한다.
         * sync 이슈가 발생할 수 있으므로, selector 를 통해 값을 추출하는 것이 안전하다.
         */
        function _setValidTime() {
            _setEndDate.call(this, $("#startDate").val());
            _setEndTime.call(this, $("#startTime").val());
        }

        function _setTime(type, value) {
            if (type == "start") {
                _setStartTime.call(this, value);
            } else if (type == "end") {
                _setEndTime.call(this, value);
			} else {}
        }

        function _setStartDate(value) {
            $("#startDate").val(value);
            $("#startDate").attr("data-prev", value);
            this.startDate = value;
            this._sdate = moment(this.startDate + "T" + this.startTime + ':00');
        }

        function _setEndDate(value) {
            $("#endDate").val(value);
            $("#endDate").attr("data-prev", value);
            this.endDate = value;
            this._edate = moment(this.endDate + "T" + this.endTime + ':00');
        }
        function _setStartTime(value) {
            $("#startTime").val(value);
            $("#startTime").attr("data-prev", value);
            this.startTime = value;
            this._sdate = moment(this.startDate + "T" + this.startTime + ':00');
        }

        function _setEndTime(value) {
            $("#endTime").val(value);
            $("#endTime").attr("data-prev", value);
            this.endTime = value;
            this._edate = moment(this.endDate + "T" + this.endTime + ':00');
        }

        return Klass;
    })(Util, Language);


    return {
        // layer 전용.
        "addSimpleEvent": function (options) {
            var layer = new SimpleAddEventLayer(options || {});
            layer.open();
        },
        // 앞으론 이걸 쓰자.
        init: function (options) {
            var picker = new SimpleAddEventLayer(options || {});
            picker.init();

            return picker;
        }
    };
}, jQuery, _, moment);