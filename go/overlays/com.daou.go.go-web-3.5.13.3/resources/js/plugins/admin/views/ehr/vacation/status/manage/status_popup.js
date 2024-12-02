define("admin/views/ehr/vacation/status/manage/status_popup", function (require) {

    var Backbone = require("backbone");
    var adminLang = require("i18n!admin/nls/admin");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require('i18n!nls/commons');

    var StatusPopupTpl = require("hgn!admin/templates/ehr/vacation/status/manage/status_popup");
    var StatusModel = require("admin/models/ehr/vacation/status");
    var CommonUtil = require("libs/go-utils");
    var lang = {
        '코드': adminLang['코드'],
        '연차 유형 설정': VacationLang['연차유형 설정'],
        '휴가종류': VacationLang['휴가종류'],
        '차감': adminLang['차감'],
        '차감안함': adminLang['차감안함'],
        '연차 수': VacationLang['연차 수'],
        '설정': adminLang['설정'],
        '사용': adminLang['사용'],
        '미사용': adminLang['미사용'],
        '적용': adminLang['적용'],
        '적용 안 함': adminLang['적용 안 함'],
        '사용여부': adminLang['사용여부'],
        '포함': adminLang['포함'],
        '미포함': adminLang['미포함'],
        '공휴일 포함 여부': VacationLang['공휴일 포함 여부'],
        '공휴일 포함 여부 툴팁': VacationLang['공휴일 포함 여부 툴팁'],
        '유급': VacationLang['유급'],
        '무급': VacationLang['무급'],
        '유/무급': VacationLang['유/무급'],
        '유/무급 툴팁': VacationLang['유/무급 툴팁'],
        '사용 가능일 수': VacationLang['사용 가능일 수'],
        '사용 가능일 수 툴팁': VacationLang['사용 가능일 수 툴팁'],
        '사용 가능일 수 가이드': VacationLang['사용 가능일 수 가이드'],
        "휴가종류명은 특수문자 _ 을 포함할 수 없습니다.": VacationLang["휴가종류명은 특수문자 _ 을 포함할 수 없습니다."],
        "사용 가능일 수를 입력해야 합니다.": VacationLang["사용 가능일 수를 입력해야 합니다."],
        '확인': CommonLang['확인'],
        '취소': CommonLang['취소'],
        '닫기': CommonLang['닫기'],
        '시작/종료 시간': VacationLang['시작/종료 시간'],
        '시작/종료 시간 툴팁': VacationLang['시작/종료 시간 툴팁'],
        '오전(전)': VacationLang['오전(전)'],
        '오전(후)': VacationLang['오전(후)'],
        '오후(전)': VacationLang['오후(전)'],
        '오후(후)': VacationLang['오후(후)']
    };

    return Backbone.View.extend({
        initialize: function (options) {
            this.statusModel = options.statusModel ? options.statusModel : new StatusModel();
            this.refreshCallback = options.refreshCallback;
            this.validateCallback = options.validateCallback;
        },

        render: function () {
            this.el = $.goPopup({
                header: lang['연차 유형 설정'],
                contents: StatusPopupTpl({
                    lang: lang,
                    data: this.statusModel.attributes
                }),
                buttons: [
                    {
                        autoclose: false,
                        btext: lang['확인'],
                        btype: "confirm",
                        callback: $.proxy(this.save, this)
                    },
                    {
                        btext: lang['취소'],
                        btype: "cancel",
                    }]
            });
            this.vacationStatusCodeEl = this.el.find('#vacationStatusCode');
            this.vacationStatusNameEl = this.el.find('#vacationStatusName');
            this.vacationStatusEnableEl = this.el.find('#vacationStatusEnable');
            this.useVacationPointEl = this.el.find('#useVacationPoint');
            this.canBeUsedHolidayEl = this.el.find('#canBeUsedHoliday');
            this.paidEl = this.el.find('#paid');
            this.limitedEl = this.el.find('#limited');
            this.availableMaxEl = this.el.find('#availableMax');
            this.useTimeDetailsEl = this.el.find('#useTimeDetails');

            this.q1HourStartEl = this.el.find('#Q1_HOUR_START');
            this.q1MinuteStartEl = this.el.find('#Q1_MINUTE_START');
            this.q1HourEndEl = this.el.find('#Q1_HOUR_END');
            this.q1MinuteEndEl = this.el.find('#Q1_MINUTE_END');
            this.q2HourStartEl = this.el.find('#Q2_HOUR_START');
            this.q2MinuteStartEl = this.el.find('#Q2_MINUTE_START');
            this.q2HourEndEl = this.el.find('#Q2_HOUR_END');
            this.q2MinuteEndEl = this.el.find('#Q2_MINUTE_END');
            this.q3HourStartEl = this.el.find('#Q3_HOUR_START');
            this.q3MinuteStartEl = this.el.find('#Q3_MINUTE_START');
            this.q3HourEndEl = this.el.find('#Q3_HOUR_END');
            this.q3MinuteEndEl = this.el.find('#Q3_MINUTE_END');
            this.q4HourStartEl = this.el.find('#Q4_HOUR_START');
            this.q4MinuteStartEl = this.el.find('#Q4_MINUTE_START');
            this.q4HourEndEl = this.el.find('#Q4_HOUR_END');
            this.q4MinuteEndEl = this.el.find('#Q4_MINUTE_END');

            this.bindEvent();
            this.availableMaxEl.attr("readOnly", !this.statusModel.get('limited'));
            this.setTimeDetailsReadOnly(!this.statusModel.get('useTimeDetails'));
            this.renderTimeDetails(this.statusModel.get('timeDetailsModel'));

            return this.popupEl;
        },
        setTimeDetailsReadOnly: function (disabled) {
            this.q1HourStartEl.attr('disabled', disabled);
            this.q1MinuteStartEl.attr('disabled', disabled);
            this.q1HourEndEl.attr('disabled', disabled);
            this.q1MinuteEndEl.attr('disabled', disabled);
            this.q2HourStartEl.attr('disabled', disabled);
            this.q2MinuteStartEl.attr('disabled', disabled);
            this.q2HourEndEl.attr('disabled', disabled);
            this.q2MinuteEndEl.attr('disabled', disabled);
            this.q3HourStartEl.attr('disabled', disabled);
            this.q3MinuteStartEl.attr('disabled', disabled);
            this.q3HourEndEl.attr('disabled', disabled);
            this.q3MinuteEndEl.attr('disabled', disabled);
            this.q4HourStartEl.attr('disabled', disabled);
            this.q4MinuteStartEl.attr('disabled', disabled);
            this.q4HourEndEl.attr('disabled', disabled);
            this.q4MinuteEndEl.attr('disabled', disabled);
        },
        renderTimeDetails: function (timeDetailsModel) {
            if (timeDetailsModel) {
                this.setSelected(this.q1HourStartEl, timeDetailsModel.q1start.split(':')[0]);
                this.setSelected(this.q1MinuteStartEl, timeDetailsModel.q1start.split(':')[1]);
                this.setSelected(this.q1HourEndEl, timeDetailsModel.q1end.split(':')[0]);
                this.setSelected(this.q1MinuteEndEl, timeDetailsModel.q1end.split(':')[1]);

                this.setSelected(this.q2HourStartEl, timeDetailsModel.q2start.split(':')[0]);
                this.setSelected(this.q2MinuteStartEl, timeDetailsModel.q2start.split(':')[1]);
                this.setSelected(this.q2HourEndEl, timeDetailsModel.q2end.split(':')[0]);
                this.setSelected(this.q2MinuteEndEl, timeDetailsModel.q2end.split(':')[1]);

                this.setSelected(this.q3HourStartEl, timeDetailsModel.q3start.split(':')[0]);
                this.setSelected(this.q3MinuteStartEl, timeDetailsModel.q3start.split(':')[1]);
                this.setSelected(this.q3HourEndEl, timeDetailsModel.q3end.split(':')[0]);
                this.setSelected(this.q3MinuteEndEl, timeDetailsModel.q3end.split(':')[1]);

                this.setSelected(this.q4HourStartEl, timeDetailsModel.q4start.split(':')[0]);
                this.setSelected(this.q4MinuteStartEl, timeDetailsModel.q4start.split(':')[1]);
                this.setSelected(this.q4HourEndEl, timeDetailsModel.q4end.split(':')[0]);
                this.setSelected(this.q4MinuteEndEl, timeDetailsModel.q4end.split(':')[1]);
            }
        },

        bindEvent: function () {
            this.useVacationPointEl.find('button').click($.proxy(this.onClickedUseVacationPointBtn, this));
            this.vacationStatusEnableEl.find('button').click($.proxy(this.onClickedEnableBtn, this));
            this.canBeUsedHolidayEl.find('button').click($.proxy(this.onClickedHolidayBtn, this));
            this.paidEl.find('button').click($.proxy(this.onClickedPaidBtn, this));
            this.limitedEl.find('button').click($.proxy(this.onClickedLimitedBtn, this));
            this.useTimeDetailsEl.find('button').click($.proxy(this.onClickedUseTimeDetailsBtn, this));
        },
        onClickedUseTimeDetailsBtn: function (e) {
            var $currentTarget = $(e.currentTarget);
            var prevUseTimeDetails = JSON.parse(this.useTimeDetailsEl.parent().find('.on').val());
            var useTimeDetails = JSON.parse($currentTarget.val());
            if (prevUseTimeDetails != useTimeDetails) {
                this.useTimeDetailsEl.find('[value="' + useTimeDetails.toString() + '"]').addClass('on');
                this.useTimeDetailsEl.find('[value="' + (!useTimeDetails).toString() + '"]').removeClass('on');
            }
            this.setTimeDetailsReadOnly(!useTimeDetails)
        },
        onClickedLimitedBtn: function (e) {
            var $currentTarget = $(e.currentTarget);
            var prevLimited = JSON.parse(this.limitedEl.parent().find('.on').val());
            var limited = JSON.parse($currentTarget.val());
            if (prevLimited != limited) {
                this.limitedEl.find('[value="' + limited.toString() + '"]').addClass('on');
                this.limitedEl.find('[value="' + (!limited).toString() + '"]').removeClass('on');
            }
            this.availableMaxEl.attr("readOnly", !limited);
        },
        onClickedPaidBtn: function (e) {
            var $currentTarget = $(e.currentTarget);
            var prevPaid = JSON.parse(this.paidEl.parent().find('.on').val());
            var paid = JSON.parse($currentTarget.val());
            if (prevPaid != paid) {
                this.paidEl.find('[value="' + paid.toString() + '"]').addClass('on');
                this.paidEl.find('[value="' + (!paid).toString() + '"]').removeClass('on');
            }
        },
        onClickedHolidayBtn: function (e) {
            var $currentTarget = $(e.currentTarget);
            var prevCanBeUsedHoliday = JSON.parse(this.canBeUsedHolidayEl.parent().find('.on').val());
            var canBeUsedHoliday = JSON.parse($currentTarget.val());
            if (prevCanBeUsedHoliday != canBeUsedHoliday) {
                this.canBeUsedHolidayEl.find('[value="' + canBeUsedHoliday.toString() + '"]').addClass('on');
                this.canBeUsedHolidayEl.find('[value="' + (!canBeUsedHoliday).toString() + '"]').removeClass('on');
            }
        },

        onClickedUseVacationPointBtn: function (e) {
            var $currentTarget = $(e.currentTarget);
            var prevUseVacationPoint = JSON.parse(this.useVacationPointEl.parent().find('.on').val());
            var useVacationPoint = JSON.parse($currentTarget.val());
            if (prevUseVacationPoint != useVacationPoint) {
                this.useVacationPointEl.find('[value="' + useVacationPoint.toString() + '"]').addClass('on');
                this.useVacationPointEl.find('[value="' + (!useVacationPoint).toString() + '"]').removeClass('on');
            }
        },

        onClickedEnableBtn: function (e) {
            var $currentTarget = $(e.currentTarget);
            var prevVacationStatusEnable = JSON.parse(this.vacationStatusEnableEl.parent().find('.on').val());
            var vacationStatusEnable = JSON.parse($currentTarget.val());

            if (prevVacationStatusEnable != vacationStatusEnable) {
                this.vacationStatusEnableEl.find('[value="' + vacationStatusEnable.toString() + '"]').addClass('on');
                this.vacationStatusEnableEl.find('[value="' + (!vacationStatusEnable).toString() + '"]').removeClass('on');
            }
        },

        parseTimeDetailsModel: function () {
            var result = {};
            var q1HourStart = this.q1HourStartEl.val();
            var q1MinuteStart = this.q1MinuteStartEl.val();
            var q1HourEnd = this.q1HourEndEl.val();
            var q1MinuteEnd = this.q1MinuteEndEl.val();
            result.q1start = q1HourStart + ':' + q1MinuteStart + ':00';
            result.q1end = q1HourEnd + ':' + q1MinuteEnd + ':00';

            var q2HourStart = this.q2HourStartEl.val();
            var q2MinuteStart = this.q2MinuteStartEl.val();
            var q2HourEnd = this.q2HourEndEl.val();
            var q2MinuteEnd = this.q2MinuteEndEl.val();
            result.q2start = q2HourStart + ':' + q2MinuteStart + ':00';
            result.q2end = q2HourEnd + ':' + q2MinuteEnd + ':00';

            var q3HourStart = this.q3HourStartEl.val();
            var q3MinuteStart = this.q3MinuteStartEl.val();
            var q3HourEnd = this.q3HourEndEl.val();
            var q3MinuteEnd = this.q3MinuteEndEl.val();
            result.q3start = q3HourStart + ':' + q3MinuteStart + ':00';
            result.q3end = q3HourEnd + ':' + q3MinuteEnd + ':00';

            var q4HourStart = this.q4HourStartEl.val();
            var q4MinuteStart = this.q4MinuteStartEl.val();
            var q4HourEnd = this.q4HourEndEl.val();
            var q4MinuteEnd = this.q4MinuteEndEl.val();
            result.q4start = q4HourStart + ':' + q4MinuteStart + ':00';
            result.q4end = q4HourEnd + ':' + q4MinuteEnd + ':00';

            return result;
        },

        getParam: function () {
            return {
                code: this.vacationStatusCodeEl.val(),
                name: this.vacationStatusNameEl.val(),
                enable: this.vacationStatusEnableEl.find('.on').val(),
                useVacationPoint: this.useVacationPointEl.find('.on').val(),
                canBeUsedHoliday: this.canBeUsedHolidayEl.find('.on').val(),
                paid: this.paidEl.find('.on').val(),
                limited: this.limitedEl.find('.on').val(),
                availableMax: this.availableMaxEl.val(),
                useTimeDetails: this.useTimeDetailsEl.find('.on').val(),
                timeDetailsModel: this.parseTimeDetailsModel()
            };
        },
        setSelected: function ($selectElement, value) {
            var element = $selectElement.find('option[value="' + value + '"]').attr('selected', true);
        },
        validateStatusName: function (statusName) {
            if (statusName.indexOf("_") != -1) {
                $.goMessage(lang["휴가종류명은 특수문자 _ 을 포함할 수 없습니다."]);
                return false;
            }
            return true;
        },
        validateAvailableMax: function (limited, availableMax) {
            return (limited === 'true') && !availableMax;
        },
        /**
         * 반반차 시간대 각각 종료시간이 시작시간보다 빠른지 확인
         */
        isStartTimeLaterThanEndTime: function () {
            var _self = this;
            var q1Start = moment(_self.q1HourStartEl.val() + ":" + _self.q1MinuteStartEl.val(), 'hh:mm');
            var q1End = moment(_self.q1HourEndEl.val() + ":" + _self.q1MinuteEndEl.val(), 'hh:mm');
            if (q1Start.isAfter(q1End) || q1Start.isSame(q1End)) {
                return true;
            }
            var q2Start = moment(_self.q2HourStartEl.val() + ":" + _self.q2MinuteStartEl.val(), 'hh:mm');
            var q2End = moment(_self.q2HourEndEl.val() + ":" + _self.q2MinuteEndEl.val(), 'hh:mm');
            if (q2Start.isAfter(q2End) || q2Start.isSame(q2End)) {
                return true;
            }
            var q3Start = moment(_self.q3HourStartEl.val() + ":" + _self.q3MinuteStartEl.val(), 'hh:mm');
            var q3End = moment(_self.q3HourEndEl.val() + ":" + _self.q3MinuteEndEl.val(), 'hh:mm');
            if (q3Start.isAfter(q3End) || q3Start.isSame(q3End)) {
                return true;
            }
            var q4Start = moment(_self.q4HourStartEl.val() + ":" + _self.q4MinuteStartEl.val(), 'hh:mm');
            var q4End = moment(_self.q4HourEndEl.val() + ":" + _self.q4MinuteEndEl.val(), 'hh:mm');
            if (q4Start.isAfter(q4End) || q4Start.isSame(q4End)) {
                return true;
            }
            return false;
        },
        _anyMatchOverlappingTimes(start, end, arr) {
            return _.some(arr, function (value) {
                return GO.util.isBetween(value, start, end);
            })
        },
        /**
         * 반반차 시간대가 서로 겹치는 시간이 있는지 확인
         */
        _existsOverlappingTimes: function () {
            var _self = this;

            var q1Start = moment(_self.q1HourStartEl.val() + ":" + _self.q1MinuteStartEl.val(), 'hh:mm');
            var q1End = moment(_self.q1HourEndEl.val() + ":" + _self.q1MinuteEndEl.val(), 'hh:mm');
            var q2Start = moment(_self.q2HourStartEl.val() + ":" + _self.q2MinuteStartEl.val(), 'hh:mm');
            var q2End = moment(_self.q2HourEndEl.val() + ":" + _self.q2MinuteEndEl.val(), 'hh:mm');
            var q3Start = moment(_self.q3HourStartEl.val() + ":" + _self.q3MinuteStartEl.val(), 'hh:mm');
            var q3End = moment(_self.q3HourEndEl.val() + ":" + _self.q3MinuteEndEl.val(), 'hh:mm');
            var q4Start = moment(_self.q4HourStartEl.val() + ":" + _self.q4MinuteStartEl.val(), 'hh:mm');
            var q4End = moment(_self.q4HourEndEl.val() + ":" + _self.q4MinuteEndEl.val(), 'hh:mm');

            var result = _self._anyMatchOverlappingTimes(q1Start, q1End, [q2Start, q2End, q3Start, q3End, q4Start, q4End]);
            if (result) {
                return true;
            }
            var result2 = _self._anyMatchOverlappingTimes(q2Start, q2End, [q1Start, q1End, q3Start, q3End, q4Start, q4End]);
            if (result2) {
                return true;
            }
            var result3 = _self._anyMatchOverlappingTimes(q3Start, q3End, [q1Start, q1End, q2Start, q2End, q4Start, q4End]);
            if (result3) {
                return true;
            }
            var result4 = _self._anyMatchOverlappingTimes(q4Start, q4End, [q1Start, q1End, q2Start, q2End, q3Start, q3End]);
            if (result4) {
                return true;
            }
            return false;
        },
        /**
         * 시간대가 순차적인지 확인
         * 날짜가 넘어가는 시간(23:59~00:00) 같은 경우는 예외로 가이드를 통해 안내하도록 합의
         */
        _isSequentialOrder: function () {
            var _self = this;

            var q1End = moment(_self.q1HourEndEl.val() + ":" + _self.q1MinuteEndEl.val(), 'hh:mm');
            var q2Start = moment(_self.q2HourStartEl.val() + ":" + _self.q2MinuteStartEl.val(), 'hh:mm');
            var q2End = moment(_self.q2HourEndEl.val() + ":" + _self.q2MinuteEndEl.val(), 'hh:mm');
            var q3Start = moment(_self.q3HourStartEl.val() + ":" + _self.q3MinuteStartEl.val(), 'hh:mm');
            var q3End = moment(_self.q3HourEndEl.val() + ":" + _self.q3MinuteEndEl.val(), 'hh:mm');
            var q4Start = moment(_self.q4HourStartEl.val() + ":" + _self.q4MinuteStartEl.val(), 'hh:mm');

            if (q1End.isAfter(q2Start)) {
                return false;
            }
            if (q2End.isAfter(q3Start)) {
                return false;
            }
            if (q3End.isAfter(q4Start)) {
                return false;
            }
            return true;
        },
        save: function () {
            var _self = this;
            var param = this.getParam();
            if (param.canBeUsedHoliday == 'true') {
                param.holidayPolicy = 'HOLIDAY';
                this.statusModel.set('holidayPolicy', 'HOLIDAY');
                this.statusModel.set('canBeUsedHoliday', true);
            } else {
                param.holidayPolicy = 'NONE';
                this.statusModel.set('holidayPolicy', 'NONE');
                this.statusModel.set('canBeUsedHoliday', false);
            }
            if (_self.validateAvailableMax(param.limited, param.availableMax)) {
                $.goMessage(VacationLang["사용 가능일 수를 입력해야 합니다."]);
                return;
            }
            if (param.useTimeDetails == 'true' && this.isStartTimeLaterThanEndTime()) {
                $.goMessage(VacationLang["시작/종료 시간 에러메시지"]);
                return;
            }
            if (param.useTimeDetails == 'true' && this._existsOverlappingTimes()) {
                $.goMessage(VacationLang["중복시간설정 에러메시지"]);
                return;
            }
            if (param.useTimeDetails == 'true' && !this._isSequentialOrder()) {
                $.goMessage(VacationLang["시작/종료 시간 항목간 에러메시지"]);
                return;
            }
            var isValid = _self.validateStatusName(param.name);
            if (!isValid) {
                return;
            }

            GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
            this.statusModel.save(param, {

                success: function () {
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                    $.goMessage(CommonLang['저장되었습니다.']);
                    _self.refreshCallback();
                    _self.el.close();
                },

                error: function (model, response) {
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                    if (response.responseJSON && response.responseJSON.message) {
                        $.goMessage(response.responseJSON.message);
                    } else {
                        $.goMessage(CommonLang['500 오류페이지 타이틀']);
                    }
                }
            });

        }

    });

});