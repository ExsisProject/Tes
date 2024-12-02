define('calendar/views/attendees_schedule_layer', function (require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require('backbone');

    var AttendeeItemTpl = require("hgn!calendar/templates/attendee_schedule_item");
    var Template = require('hgn!calendar/templates/attendees_schedule_layer');

    var commonLang = require('i18n!nls/commons');
    var calLang = require("i18n!calendar/nls/calendar");

    require("GO.util");

    var lang = {
        '이전': commonLang['이전'],
        '다음': commonLang['다음'],
        '닫기': commonLang['닫기'],
        '참석자 일정': calLang['참석자 일정'],
        '참석자 일정 조회': calLang['참석자 일정 조회'],
        '선택된 날짜': calLang['선택된 날짜'],
        '설정시간': calLang['설정시간'],
        '일정있음': calLang['일정있음'],
        '참석자 일정확인 최대 인원 설명': calLang['참석자 일정확인 최대 인원 설명'],
        '참석자 일정확인 상세일정 확인여부 설명': calLang['참석자 일정확인 상세일정 확인여부 설명'],
        '참석자 일정확인 기능 사용가능 알림': calLang['참석자 일정확인 기능 사용가능 알림'],
        '참석자 일정확인 기능 종일일정 알림': calLang['참석자 일정확인 기능 종일일정 알림'],
    };

    var MAX_ATTENDEES_COUNT = 50;
    var selectBarCssWidth = 50;     // 한칸에 css width: 50%
    var selectBarCssHeight = 32;    // 한칸에 css height: 32px
    var oneBlock = 30;              // 한칸에 60분
    var twoBlock = 60;              // 두칸에 60분
    var foldedBlockNum = 26;

    return Backbone.View.extend({

        events: {
            "click .att_schedule .ic_fold": "_onClickFrontRowBtn",
            "click .att_schedule .ic_folded": "_onClickFrontRowBtn",
            "click [data-attendees-route]": "_onChangeRoute",
            "click [data-attendees-close-btn]": "_hideAttendeesCheckView",
            "click [data-attendees-schedule-show-btn]": "_renderAttendeesCheckView",
        },

        unbindEvent: function () {
            $("#all_day").off("click");
        },
        bindEvent: function () {
            var _this = this;
            $("#all_day").click(function (e) {
                _this.onChangeAllDay(e);
            });
        },

        initialize: function (options) {
            this.unbindEvent();
            this.bindEvent();
            this.options = options || {};
            this.isCreateMode = _.isUndefined(this.options.model);
            this.model = this.options.model || {};
            this.initAttendees = this.options.attendees || {};
            this.initStartDate = this.options.startDate || GO.util.now();
            if (!this.isCreateMode) {
                this.initStartDate = this.model.isAllday() ? GO.util.dateFormatWithoutTimeZone(this.model.get("startTime")) : GO.util.toMoment(this.model.get("startTime")).format("YYYY-MM-DD");
                this.initAttendees = this._getAttendeesByTag();
            }

            this.isAllDay = this.isCreateMode ? false : this.model.isAllday();
        },

        render: function (attendees) {
            var selectedDate = $('#startDate').val() || this.initStartDate;
            var attendees = attendees || this.initAttendees;
            this.$el.html(Template({
                lang: lang,
                isAllDay: this.isAllDay,
                selectedDate: GO.util.toMoment(selectedDate).format("YYYYMMDD"),
                displayDate: GO.util.toMoment(selectedDate).format("MM월 DD일")
            }));

            this.addEventListener(attendees, GO.util.toMoment(selectedDate).format("YYYYMMDD"));
            this._renderingSelectBar();
            return this;
        },

        _renderAttendeesCheckView: function () {
            this.render(this._getAttendeesByTag());
        },

        _refreshAttendeesCheckView: function (selectedDate) {
            this.onChangeSelectedDate(selectedDate);
            this.refreshEventListener(GO.util.toMoment(selectedDate).format("YYYYMMDD"));
            this._renderingSelectBar();
        },

        /**
         * total minute 계산해서 해당 블록 만큼 selectbar 그리기
         */
        _renderingSelectBar: function () {
            if (!GO.util.isSameDate($('#startDate').val(), $('#endDate').val()) || $('#all_day').is(':checked')) {
                this.$el.find('[data-set-time]').hide();
                return false;
            }
            this.$el.find('[data-set-time]').show();

            var startTime = $('#startTime').val();
            var endTime = $('#endTime').val();
            var startTimeArr = startTime.split(':');
            var endTimeArr = endTime.split(':');
            var startNumHH = Number(startTimeArr[0].trim());
            var startNumMM = Number(startTimeArr[1].trim());
            var left = 0, right = 0;

            if (this._isFolding()) {
                if (_.contains([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], startNumHH)) {
                    left = (startNumHH - 7) * 100;
                    if (30 <= startNumMM) {
                        left += selectBarCssWidth;
                    }
                } else if (_.contains([20, 21, 22, 23], startNumHH)) {
                    left = 1200;
                }
            } else {
                left = (startNumHH) * 100;
                if (30 <= startNumMM) {
                    left += selectBarCssWidth;
                }
            }

            if (this._isFolding() && left >= 1300) {
                left = 1200;
            } else if (!this._isFolding() && left >= 2400) {
                left = 2300;
            }

            if (startTime === endTime) {
                right = left - 100;
            } else {
                var endNumHH = Number(endTimeArr[0].trim());
                var endNumMM = Number(endTimeArr[1].trim());
                var totalMin = 0;
                if (this._isFolding() && _.contains([0, 1, 2, 3, 4, 5, 6, 7], startNumHH)) {
                    if (_.contains([0, 1, 2, 3, 4, 5, 6, 7], endNumHH)) {
                        totalMin = twoBlock;
                    } else {
                        totalMin = (endNumHH - 7) * twoBlock;
                        if (0 < endNumMM && endNumMM <= 30) {
                            totalMin += oneBlock;
                        } else if (30 < endNumMM) {
                            totalMin += twoBlock;
                        }
                    }
                } else if (this._isFolding() && _.contains([20, 21, 22, 23], endNumHH)) {
                    if (_.contains([20, 21, 22, 23], startNumHH)) {
                        totalMin = twoBlock;
                    } else {
                        totalMin = (20 - startNumHH) * twoBlock;
                        if (30 <= startNumMM) {
                            totalMin -= oneBlock;
                        }
                    }
                } else {
                    var tmp = 0;
                    if (endNumMM >= startNumMM) {
                        totalMin += (endNumMM - startNumMM);
                    } else {
                        tmp = 1;
                        totalMin += ((twoBlock + endNumMM) - startNumMM);
                    }
                    totalMin += ((endNumHH - startNumHH - tmp) * twoBlock);

                    var remainder = totalMin % oneBlock;
                    if (remainder === 0 && (!_.contains([0, 30], endNumMM))) {
                        totalMin += oneBlock;
                    }
                }

                var pointVal = totalMin > 0 ? Math.ceil(totalMin / oneBlock) : 0;
                right = -(left);
                if (pointVal === 1) {
                    right += selectBarCssWidth;
                } else if (pointVal > 2) {
                    if (this._isFolding() && pointVal > foldedBlockNum) {
                        right -= (foldedBlockNum - 2) * selectBarCssWidth;
                    } else {
                        right -= (pointVal - 2) * selectBarCssWidth;
                    }
                } else if (pointVal === 0) {
                    right += (pointVal + 2) * selectBarCssWidth;
                }
            }

            this.$el.find('[data-set-time]').css({
                'left': left + '%',
                'right': right + '%',
                'height': this._getAttendeeCheckedCount() * selectBarCssHeight + 'px'
            });
        },

        _updateHeightSelectBar: function () {
            this.$el.find('[data-set-time]').css({'height': this._getAttendeeCheckedCount() * selectBarCssHeight + 'px'});
            this.$el.find('[data-attendees-selected-time]').css({'height': this._getAttendeeCheckedCount() * selectBarCssHeight + 'px'});
        },

        // 캘린더 일정 날짜 변경 이벤트
        onChangeDate: function () {
            console.info("attendees_schedule_layer onChangeDate");
            if (!this._isShowScheduleView()) {
                return false; // 참석자 일정 영역 존재하지 않음
            }

            if (GO.util.isSameDate($('#startDate').val(), $('#endDate').val())
                || !GO.util.isSameDate($('#startDate').val(), $('[data-attendees-selected-date]').attr('data-value'))) {
                this._refreshAttendeesCheckView($('#startDate').val());
            }

            this._renderingSelectBar();
        },

        // 캘린더 일정 시간 변경 이벤트
        onChangeTime: function (e) {
            console.info("attendees_schedule_layer onChangeTime");
            if (!this._isShowScheduleView()) {
                return false; // 참석자 일정 영역 존재하지 않음
            }

            this._renderingSelectBar();
        },

        // 캘린더 종일 체크박스 변경 이벤트
        onChangeAllDay: function () {
            console.info("attendees_schedule_layer onChangeAllDay isAllDay: " + $('#all_day').is(':checked'));
            this.isAllDay = $('#all_day').is(':checked');
            if (this.isAllDay) {
                this._hideAttendeesCheckView();
                this._showCheckedAllDayDescView();
            } else {
                this._renderAttendeesCheckView();
            }
        },

        _onChangeRoute: function (e) {
            console.info("attendees_schedule_layer _onChangeRoute");

            var route = $(e.currentTarget).attr('data-attendees-route');
            var checkedDate = $('[data-attendees-selected-date]').attr('data-value');
            var newDate;
            if (route === 'previous') {
                newDate = GO.util.toMoment(checkedDate).add("days", -1);
            } else if (route === 'next') {
                newDate = GO.util.toMoment(checkedDate).add("days", 1);
            }
            this._refreshAttendeesCheckView(newDate);
        },

        _onClickFrontRowBtn: function (e) {
            var $untimeBtn = this.$el.find('[data-untime-btn]');
            if ($(e.currentTarget).prop('class') === 'ic_folded') {
                $('[data-untime]').removeClass('untime');
                $('[data-untime-0]').text('0');
                $('[data-untime-19]').text('19');
                $untimeBtn.removeClass('ic_folded').addClass('ic_fold');
                $untimeBtn.attr('data-is-folding', false);
            } else {
                $('[data-untime]').addClass('untime');
                $('[data-untime-0]').text('0 ~');
                $('[data-untime-19]').text('19 ~');
                $untimeBtn.removeClass('ic_fold').addClass('ic_folded');
                $untimeBtn.attr('data-is-folding', true);
            }
            this._renderingSelectBar();

        },

        onChangeSelectedDate: function (newDate) {
            console.info("attendees_schedule_layer onChangeSelectedDate");
            var selectedDate = GO.util.toMoment(newDate || $('#startDate').val());
            var $selectedDate = this.$el.find('[data-attendees-selected-date]');
            $selectedDate.attr('data-value', selectedDate.format('YYYYMMDD'));
            $selectedDate.text(selectedDate.format('MM월 DD일'));
        },

        addEventListener: function (addedAttendees) {
            console.info("attendees_schedule_layer addEventListener");
            if (_.isUndefined(addedAttendees) || _.isNull(addedAttendees)) {
                return false;
            } else if (_.isArray(addedAttendees) && addedAttendees.length === 0) {
                return false;
            } else if (!_.isArray(addedAttendees)) {
                addedAttendees = [addedAttendees];
            }

            var selectedDate = this.$el.find('[data-attendees-selected-date]').attr('data-value') || GO.util.toMoment(GO.util.now()).format("YYYYMMDD");
            this._getScheduleAndRendingRow(addedAttendees, selectedDate);
        },

        refreshEventListener: function (selectedDate) {
            console.info("attendees_schedule_layer refreshEventListener selectedDate: " + selectedDate);
            var attendees = this._getAttendeesBySchedule();
            var selectedDate = selectedDate || this.$el.find('[data-attendees-selected-date]').attr('data-value');
            this._getScheduleAndRendingRow(attendees, selectedDate, true);
        },

        _getScheduleAndRendingRow: function (attendees, selectedDate, isRefresh) {
            console.info("attendees_schedule_layer _getScheduleAndRendingRow selectedDate: " + selectedDate);
            var _this = this;
            $.ajax({
                url: '/api/calendar/attendees/schedules?' + this._getParams(attendees, selectedDate),
                type: 'GET',
                async: true,
                contentType: 'application/json'
            }).done(function (resp) {
                var scheduleData = [];
                if (resp.code === '200') {
                    scheduleData = resp.data;
                }
                if (isRefresh) {
                    _this._refreshRowByAttendee(scheduleData);
                } else {
                    _this._renderingRowByAttendee(attendees, scheduleData);
                }
            }).fail(function () {
                console.info("attendees  schedules data get error");
            });
        },

        _getParams: function (attendees, selectedDate) {
            var userIds = [];
            _.each(attendees, function (attendee, index) {
                if (index < MAX_ATTENDEES_COUNT) {
                    userIds.push('userIds=' + attendee.id);
                }
            });
            return 'checkDate=' + selectedDate + '&' + userIds.join("&");
        },

        removeEventListener: function (removeUserId) {
            console.info("attendees_schedule_layer removeEventListener");
            var $target = this.$el.find('[data-attendees-users-id-' + removeUserId + ']');
            var isExist = $target.length > 0 || false;
            if (!isExist) {
                return false; // 존재하지 않음
            }

            $target.remove();

            var nextAttendeeUserId = $('#attendee-list').find('#attendee-' + this.$el.find('[data-attendees-users]:last').attr('data-user-id')).next().attr('data-id');
            if (!_.isUndefined(nextAttendeeUserId)) {
                this.addEventListener(this._getAttendeesByTag(nextAttendeeUserId));
            }
            this._updateHeightSelectBar();
        },

        _refreshRowByAttendee: function (scheduleData) {
            console.info("attendees_schedule_layer _refreshRowByAttendee");
            _.each(scheduleData, function (data) {
                var $user = this.$el.find('[data-attendees-users-id-' + data.userId + ']');
                $user.find('[data-attendees-tr]').empty();
                $user.find('[data-attendees-tr]').append(this._renderingTime(data.scheduleModels));
            }, this);
            this._updateHeightSelectBar();
        },

        _renderingRowByAttendee: function (addAttendees, scheduleData) {
            console.info("attendees_schedule_layer _renderingRowByAttendee");
            var addableCount = MAX_ATTENDEES_COUNT - this._getAttendeeCheckedCount();
            if (addableCount <= 0) {
                return false;
            }

            var size = addableCount > addAttendees.length ? addAttendees.length : addableCount;
            var index = 0;
            for (var i = 0; index < size; i++) {
                var $user = this.$el.find('[data-attendees-users-id-' + addAttendees[i].id + ']');
                var data = _.find(scheduleData, function (s) {
                    return addAttendees[i].id == s.userId
                });

                if ($user.length > 0) {
                    $user.find('[data-attendees-tr]').empty();
                    $user.find('[data-attendees-tr]').append(this._renderingTime(data.scheduleModels));
                } else {
                    $('[data-attendees-schedule-user-contents]').append(AttendeeItemTpl({
                        userId: addAttendees[i].id,
                        name: addAttendees[i].name
                    }));
                    this.$el.find('[data-attendees-users-id-' + addAttendees[i].id + ']').find('[data-attendees-tr]').append(this._renderingTime(data.scheduleModels));
                    index++;
                }
            }
            this._updateHeightSelectBar();
        },

        _renderingTime: function (schedules) {
            var hasAllDay = false;
            for (var idx in schedules) {
                if (schedules[idx].timeType === "allday") {
                    hasAllDay = true;
                    break;
                }
            }

            var $tdList = '';
            for (var j = 0; j < 24; j++) {
                if (_.contains([1, 2, 3, 4, 5, 6, 7, 20, 21, 22, 23], j)) {
                    $tdList += this._isFolding() ? '<td class="untime" data-untime>' : '<td data-untime>';
                } else {
                    $tdList += '<td>';
                }

                var displayHH = GO.util.numberPad(j, 2);
                var checkedOClock = false;
                var checkedHalf = false;
                for (var k = 0; k < schedules.length; k++) {
                    var scheduleStartHH = GO.util.toMoment(schedules[k].targetStartTime).get('hour');
                    var scheduleEndHH = GO.util.toMoment(schedules[k].targetEndTime).get('hour');
                    var scheduleEndMM = GO.util.toMoment(schedules[k].targetEndTime).get('minute');

                    if (this._isFolding()) {
                        if (j === 0) {
                            if (scheduleStartHH <= 7) {
                                checkedOClock = true;
                                checkedHalf = true;
                            }
                        } else if (j === 19) {
                            if (19 < scheduleStartHH) {
                                checkedHalf = true;
                                checkedOClock = true;
                            }
                        }
                    }

                    if (j == scheduleStartHH) {
                        checkedHalf = true;
                        var scheduleStartMM = GO.util.toMoment(schedules[k].targetStartTime).get('minute');
                        if (scheduleStartMM < 30) {
                            checkedOClock = true;
                        }
                    } else if (scheduleStartHH < j && j < scheduleEndHH) {
                        checkedOClock = true;
                        checkedHalf = true;
                    } else if (j == scheduleEndHH) {
                        if (0 < scheduleEndMM) {
                            checkedOClock = true;
                        }
                        if (31 < scheduleEndMM) {
                            checkedHalf = true;
                        }
                    }
                }

                $tdList += '<div class="txt oclock ' + (hasAllDay || checkedOClock ? 'busy' : '') + '">' + displayHH + ':00' + '</div>';
                $tdList += '<div class="txt halfhour ' + (hasAllDay || checkedHalf ? 'busy' : '') + '">' + displayHH + ':30' + '</div></td>';
            }
            return $tdList;
        },

        _showCheckedAllDayDescView: function () {
            this.$el.find('[data-attendees-schedule-show-desc]').text(lang["참석자 일정확인 기능 종일일정 알림"]);
            this.$el.find('[data-attendees-schedule-show-btn]').remove();
        },

        _hideAttendeesCheckView: function (e) {
            this.$el.find('[data-attendees-schedule-content]').remove();
            this.$el.find('[data-attendees-notice-el]').show();
        },

        _isShowScheduleView: function () {
            return this.$el.find('[data-attendees-schedule-content]').length > 0;
        },

        _isFolding: function () {
            return this.$el.find('[data-untime-btn]').attr('data-is-folding') === 'true' || false;
        },

        _getAttendeesByTag: function (userId) {
            var elements = $('#attendee-list').find("li:not([data-button])");
            var attendees = new Array();

            if (!_.isUndefined(userId)) {
                var $element = $(_.find(elements, function (el) {
                    var $el = $(el);
                    return $el.attr("data-id") == userId;
                }));
                attendees.push({
                    "id": $element.attr("data-id"),
                    "name": $element.attr("data-name")
                });
                return attendees;
            } else {
                var total = this._getAttendeeTagCount();
                for (var i = 0; i < total && i < MAX_ATTENDEES_COUNT; i++) {
                    var $element = $(elements[i]);
                    attendees.push({
                        "id": $element.attr("data-id"),
                        "name": $element.attr("data-name")
                    });
                }
            }
            return attendees;
        },

        _getAttendeesBySchedule: function () {
            var elements = $('[data-attendees-schedule-user-contents]').find("[data-attendees-users]");
            var attendees = new Array();

            var size = this._getAttendeeCheckedCount();
            for (var i = 0; i < size; i++) {
                var $element = $(elements[i]);
                attendees.push({
                    "id": $element.attr('data-user-id'),
                    "name": $element.attr('[data-user-id]')
                });
            }
            return attendees;
        },

        _getAttendeeTagCount: function () {
            return $('#attendee-list').find("li:not([data-button])").length || 0;
        },

        _getAttendeeCheckedCount: function () {
            var length = $('[data-attendees-schedule-user-contents]').find('[data-attendees-users]').length || 0;
            return length > MAX_ATTENDEES_COUNT ? MAX_ATTENDEES_COUNT : length;
        },

    });
});