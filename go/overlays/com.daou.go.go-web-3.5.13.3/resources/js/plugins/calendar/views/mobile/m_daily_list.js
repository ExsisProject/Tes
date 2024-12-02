define("calendar/views/mobile/m_daily_list", function (require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var GO = require("app");
    var calendarLang = require("i18n!calendar/nls/calendar");
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var LayoutTpl = require("hgn!calendar/templates/mobile/m_daily_list");
    var TplDailyListUnit = require("hgn!calendar/templates/mobile/m_daily_list_unit");
    var CalendarCol = require("calendar/collections/mobile/calendar");
    var Calendars = require("calendar/collections/calendars");
    var CalUtil = require("calendar/libs/util");
    var UserProfileModel = require("models/user_profile");
    require("jquery.go-popup");
    require("GO.util");
    require("jquery.go-validation");
    require("jquery.placeholder");

    var instance = null;
    var lang = {
        'no_event': calendarLang['등록된 일정이 없습니다'],
        'monthly': calendarLang['월간'],
        'today': calendarLang['오늘']
    };

    var dailyList = Backbone.View.extend({
        el: '#content',
        events: {
            'vclick a[data-btntype="moveDate"]': 'moveDate',
            'vclick a[data-btntype="today"]': 'moveToday',
            'vclick dd.eventWrap': 'moveEvent',
            'vclick a[data-btntype="monthView"]': 'moveMonthlyView'
        },
        initialize: function () {
            this.$el.off();
            this.headerToolbarView = HeaderToolbarView;
            this.checkedCalIds = _.isUndefined(CalUtil.getSavedSelectedCalendar()) || CalUtil.getSavedSelectedCalendar() === "" ? [] : CalUtil.getSavedSelectedCalendar().split(',');
            this.calLocalStorage = {type: "daily"};
            GO.util.appLoading(true);
        },
        moveMonthlyView: function (e) {
            e.preventDefault();
            var currentDate = $("#currentDatePart").attr("data-date");
            var url = ["calendar", "monthly", currentDate];
            GO.router.navigate(url.join('/'), {trigger: true, pushState: true});

        },
        moveEvent: function (e) {
            var self = this;
            e.preventDefault();
            e.stopPropagation(); // 뒤로가기시 이벤트 중첩 방지
            var $target = $(e.currentTarget);
            var url = "calendar/" + $target.attr("data-calendarid") + "/event/" + $target.attr("data-eventid");

            $.ajax({
                type: "GET",
                url: GO.contextRoot + "api/" + url,
            }).done(function (event) {
                var eventData = event.data;
                var auth = _.where(eventData.attendees, {id: GO.session("id")}).length > 0;
                if (eventData && (eventData.visibility !== 'private' || auth)) {
                    GO.util.setLocalStorage("calLocalStorage", self.calLocalStorage);
                    GO.router.navigate(url, {
                        trigger: true,
                        pushState: true
                    });
                }
            }).fail(function () {
                return;
            });

        },
        drawDailyList: function (moveDate) {
            var prevDate = GO.util.calDate(moveDate, 'days', -1);
            var nextDate = GO.util.calDate(moveDate, 'days', 1);
            $("#currentDatePart").html(GO.util.toMoment(moveDate).format("YYYY.MM.DD")).attr("data-date", GO.util.shortDate(moveDate));
            $("#prevDatePart").attr("data-date", prevDate);
            $("#nextDatePart").attr("data-date", nextDate);

            var opt = {
                selectedDate: GO.util.toMoment(moveDate.clone())
            };
            $("#dailyListWrap").html(this.makeDailyListUnit(opt));
            GO.router.navigate('calendar/daily/' + GO.util.shortDate(moveDate), false);

            this.calLocalStorage.date = GO.util.shortDate(moveDate);


        },
        moveToday: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var currentDate = GO.util.toMoment(new Date());
            this.drawList(currentDate);
        },
        moveDate: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var target = $(e.currentTarget);
            var moveDate = GO.util.toMoment(target.attr("data-date"));
            this.drawList(moveDate);

        },
        checkExistDate: function (moveDate) {
            var calDate = GO.util.calDate(moveDate, 'days', 2);
            var existDate = false;
            $.each(this.collection.toJSON(), function (k, v) {
                if (GO.util.isSameDate(calDate, v.datetime)) {
                    existDate = true;
                    return false;
                }
            });
            return existDate;
        },
        drawList: function (moveDate) {
            var existDate = this.checkExistDate(moveDate);
            if (existDate) {
                this.drawDailyList(moveDate);
            } else {

                var _this = this;
                this.year = moveDate.year();
                this.month = (this.month == 12) ? 1 : moveDate.month() + 1;
                var calCol = this.getDateData(this.checkedCalIds);
                calCol.on("reset", function (collection, response) {
                    _this.collection = collection;
                    _this.drawDailyList(moveDate);
                });
            }
        },
        getDateData: function (calendarIds) {
            var calCol = CalendarCol.getCollection({
                year: this.year,
                month: this.month,
                addWeek: 1,
                calendarIds: calendarIds,
                includingAttendees: true
            });
            return calCol;
        },
        render: function (opt) {
            GO.util.pageDone();
            var selectDate = GO.util.toMoment();

            if (opt.selectDate) {
                selectDate = GO.util.toMoment(opt.selectDate);
            }

            this.year = selectDate.years();
            this.month = selectDate.month() + 1;
            this.day = selectDate.date();

            var opt = _.extend(opt, {
                year: this.year,
                month: this.month,
                day: this.day,
                selectedDate: selectDate
            });

            var _this = this;

            var dailyListTpl = LayoutTpl({
                prevDate: _this.makeDate(opt, -1),
                nextDate: _this.makeDate(opt, 1),
                currentDate: GO.util.toMoment(selectDate).format("YYYY.MM.DD"),
                currentDateBasic: GO.util.shortDate(selectDate),
                lang: lang,
            });
            _this.$el.html(dailyListTpl);

            var calCol = this.getDateData(this.checkedCalIds);
            calCol.on("reset", function (collection) {
                _this.collection = collection;
                var dailyListUnitTpl = _this.makeDailyListUnit(opt);

                _this.$el.find('#dailyListWrap').html(dailyListUnitTpl);

                GO.util.appLoading(false);

                _this.calLocalStorage.date = GO.util.shortDate([opt.year, opt.month, opt.day].join('/'));

            });

            this.headerToolbarView.render({
                title: calendarLang['일정목록'],
                isList: true,
                isSideMenu: true,
                isHome: true,
                isSearch: true,
                isWriteBtn: true,
                writeBtnCallback: function () {
                    GO.util.setLocalStorage("calLocalStorage", _this.calLocalStorage);
                    GO.router.navigate('calendar/write/' + $("#currentDatePart").attr("data-date"), {
                        trigger: true,
                        pushState: true
                    });
                }
            });
        },

        makeDate: function (opt, amount) {
            var date = [opt.year, opt.month, opt.day].join('/');
            var calDate = GO.util.calDate(date, 'days', amount);
            return calDate;
        },

        makeDailyListUnit: function (opt) {

            var parseDate = function () {
                return GO.util.formatDatetime(this.date, null, "MM.DD (dd)");
            };

            var isWeekend = function () {
                var day = this.date.format("dd");
                if (day.indexOf("토") > -1) {
                    return "sat";
                } else if (day.indexOf("일") > -1) {
                    return "sun"
                } else {
                    return "";
                }
            };

            //일정 타입별 표기
            var parseTimeType = function () {


                if (this.timeType == "allday") {
                    return calendarLang['종일'];
                } else {
                    var start, end;
                    if (GO.util.isSameDate(this.currentDatetime, this.startTime)) {
                        start = GO.util.hourMinute(this.startTime);
                    } else {
                        start = calendarLang['계속'];
                    }
                    if (GO.util.isSameDate(this.currentDatetime, this.endTime)) {
                        end = GO.util.hourMinute(this.endTime);
                    } else {
                        end = calendarLang['계속'];
                        if (start == end) {
                            return calendarLang['종일'];
                        }
                    }
                }

                return start + "~" + end;
            };

            //datatime을 eventList의 currentDatetime에 넣음.
            var eventData = this.setThreeDaysCal(opt);
            var selectedCalOwnerIds = _.isUndefined(CalUtil.getSavedSelectedCalendarOwnerId()) || CalUtil.getSavedSelectedCalendarOwnerId() === "" ? [] : CalUtil.getSavedSelectedCalendarOwnerId();
            var thumbnailList = _.isNull(sessionStorage.getItem("calendar-thumbnail-list")) ? [] : JSON.parse(sessionStorage.getItem("calendar-thumbnail-list"));

            _.each(eventData, function (v, k) {
                $.each(v.eventList, function (m, n) {
                    n.currentDatetime = v.date;
                });

                var filterEvents = _.filter(v.eventList, function (event) {
                    if (event.type === "holiday") {
                        eventData[k]['isHoliday'] = true;
                        eventData[k]['holidayName'] = GO.util.escapeHtml(event.summary);
                    } else if (event.summary[0] != '-') {
                        return true;
                    }
                });

                var filterSameSchedule = function (events) {
                    var scheduleIdSet = [];
                    var scheduleSet = _.filter(events, function (event) {
                        if (scheduleIdSet.indexOf(event.id) > -1) {
                            return false;
                        }
                        var alreadyFinishedSchedule = moment(v.date).isSame(event['endTime']) && moment(event['endTime']).format("HH:mm") === "00:00" && event['timeType'] === "timed";
                        if (!alreadyFinishedSchedule) {
                            scheduleIdSet.push(event.id);
                            return true;
                        }
                    });
                    return scheduleSet;
                };

                var getThumbnail = function (event) {
                    var calendarOwnerId = event.calendarOwnerId;
                    if (_.isUndefined(calendarOwnerId)) {
                        return (GO.contextRoot + "resources/images/mobile/photo_profile_group.jpg");
                    }

                    if (isGroupSchedule(event)) {
                        event.color = "_group";
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

                var isGroupSchedule = function (event) {
                    if (event.attendees.length > 1) {
                        var isGroupSchedule = false;
                        var feedAttendeeNum = 0;
                        _.any(event.attendees, function (attendee) {
                            if (selectedCalOwnerIds.indexOf(attendee.id) > -1) {
                                feedAttendeeNum++;
                            }
                            if (feedAttendeeNum === 2) {
                                isGroupSchedule = true;
                                return true;
                            }
                        });
                        if (isGroupSchedule) {
                            return true;
                        }
                    }
                    return false;
                };

                var scheduleSet = filterSameSchedule(filterEvents);

                _.each(scheduleSet, function (event) {
                    event.isSecret = event.visibility === "private";
                    event.thumbnail = getThumbnail(event);
                });
                eventData[k]['eventList'] = scheduleSet;
            });

            var parseSummary = function () {
                return GO.util.escapeHtml(this.summary);
            };


            var isHolidayAnniversary = function () {
                return this.type === 'anniversary';
            };

            var tpldailyList = TplDailyListUnit({
                data: eventData,
                isWeekend: isWeekend,
                parseDate: parseDate,
                parseTimeType: parseTimeType,
                lang: lang,
                parseSummary: parseSummary,
                isHolidayAnniversary: isHolidayAnniversary
            });

            return tpldailyList;
        },
        setThreeDaysCal: function (opt) {
            var eventList = [];
            var MAX_DAYS = 7;
            var selectedDate = opt.selectedDate.clone();

            for (var i = 0; i < MAX_DAYS; i++) {
                $.each(this.collection.toJSON(), function (k, v) {
                    var eventDate = GO.util.dateWithoutTimeZone(v.datetime);
                    var date = GO.util.dateWithoutTimeZone(selectedDate);
                    if (!GO.util.isSameDate(eventDate, date)) {
                        return;
                    }

                    eventList.push({
                        date: eventDate,
                        eventList: v.eventList.sort(function (a, b) { //시작시간이 같다면 종료시간이 빠른일정이 먼저
                            if (a.startTime == b.startTime) {
                                return (a.endTime > b.endTime) ? 1 : -1;
                            }
                            return 0;
                        })
                    });
                });

                selectedDate.add(1, 'days');
            }

            return eventList;
        }

    });

    return {
        render: function (opt) {
            instance = new dailyList();
            instance.render(_.extend(opt));
        }
    };

});