define(function (require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require('app');
    var _ = require('underscore');
    var Hogan = require('hogan');

    var TimelineApprovalModel = require('approval/daouform/timeline/models/timelineApproval');

    var timelineLang = require("i18n!timeline/nls/timeline");
    var commonLang = require('i18n!nls/commons');
    var TimelineLang = require("i18n!timeline/nls/timeline");


    var Timeline = Backbone.View.extend({
        initialize: function (options) {
            this.isChecked = false;
            this.$startDateEl = $(options.startDate); // 시작일
            this.$totalTimeEl = $(options.totalTime); // 휴가 유형  영역
            this.$approvalNameEl = $(options.approvalName); // 휴가 유형  영역
            this.$weeklyTotalTimeEl = $(options.weeklyTotalTime); // 잔여연차 관련 영역
            this.$monthlyTotalTimeEl = $(options.monthlyTotalTime); // 사용연차 관련 영역
            this.$descriptionEl = $(options.description); // 신청연차 관련영역
            this.variablesData = options.variables;
            this.drafterId = options.docModel.drafterId;
            this.closedDayOfWeek = options.closedDayOfWeek; //지정
            this.startHour = 0;
            this.startMinute = 0;
            this.endHour = 0;
            this.endMinute = 0;
        },

        render: function () {
            var self = this;
            this.$startDateEl.datepicker("setDate", new Date());
            this.startDate = GO.util.customDate(self.$startDateEl.val().split("(")[0], "YYYY-MM-DD");

            this.renderData();


            this.bindEvent();
            this.unBindEvent();
            /*            $('#cseltest').trigger('change')*/
        },

        renderButton: function () {
            this.$totalTimeEl.append("<span id='timeCheck' class='btn_minor'>확인</span>");
        },

        renderData: function () {
            var _self = this;
            this.$monthlyTotalTimeEl.text(this.variablesData.monthlyTotalTimeStr + " (초과 : " + this.variablesData.monthlyExtensionTimeStr + " )");
            this.$weeklyTotalTimeEl.text(this.variablesData.weeklyTotalTimeStr + " (초과 : " + this.variablesData.weeklyExtensionTimeStr + " )");

            var approvals = this.variablesData.approvals;
            if (approvals) {
                this.approvals = $.parseJSON(this.variablesData.approvals);
                this.approvals = _.filter(this.approvals, function(approval) { return approval.id != _self.variablesData.approvalId});
                var data = {
                    "data": this.approvals,
                    "getSimpleTimeStr": this.getSimpleTimeStr
                };

                var html = '{{#data}}\n' +
                    '    <tr>\n' +
                    '        <td data-value="{{approvalStatus}}" style="width:150px;padding: 3px; border: 1px solid black; width: 700px; height: 22px; text-align: left; color: rgb(0, 0, 0); font-size: 12px;  vertical-align: middle; background: rgb(255, 255, 255);">\n' +
                    '            <span id="statusHistory" style="font-family: malgun gothic, dotum, arial, tahoma; font-size: 9pt; line-height: normal; margin-top: 0px; margin-bottom: 0px;">{{approvalStatus}}</span>\n' +
                    '        </td>\n' +
                    '        <td style="width:150px;padding: 3px; border: 1px solid black; width: 700px; height: 22px; text-align: left; color: rgb(0, 0, 0); font-size: 12px;  vertical-align: middle; background: rgb(255, 255, 255);">\n' +
                    '            <span id="workingDateHistory" style="font-family: malgun gothic, dotum, arial, tahoma; font-size: 9pt; line-height: normal; margin-top: 0px; margin-bottom: 0px;">{{name}}</span>\n' +
                    '        </td>\n' +
                    '        <td style="width:150px;padding: 3px; border: 1px solid black; width: 700px; height: 22px; text-align: left; color: rgb(0, 0, 0); font-size: 12px;  vertical-align: middle; background: rgb(255, 255, 255);">\n' +
                    '             <span id="workingDateHistory" style="font-family: malgun gothic, dotum, arial, tahoma; font-size: 9pt; line-height: normal; margin-top: 0px; margin-bottom: 0px;">{{baseDate}}</span>\n' +
                    '        </td>\n' +
                    '        <td style="width:150px;padding: 3px; border: 1px solid black; width: 700px; height: 22px; text-align: left; color: rgb(0, 0, 0); font-size: 12px;  vertical-align: middle; background: rgb(255, 255, 255);">\n' +
                    '             <span style="font-family: malgun gothic, dotum, arial, tahoma; font-size: 9pt; line-height: normal; margin-top: 0px; margin-bottom: 0px;">{{getSimpleTimeStr}}</span>' +
                    '        </td>\n' +
                    '        <td style="width:150px;padding: 3px; border: 1px solid black; width: 700px; height: 22px; text-align: left; color: rgb(0, 0, 0); font-size: 12px;  vertical-align: middle; background: rgb(255, 255, 255);">\n' +
                    '            <span id="descriptionHistory" style="font-family: malgun gothic, dotum, arial, tahoma; font-size: 9pt; line-height: normal; margin-top: 0px; margin-bottom: 0px;">{{reasons}}</span>\n' +
                    '        </td>\n' +
                    '    </tr>{{/data}}'
                var output = Hogan.compile(html).render(data);
                $("#historyList").html(output);
            }
        },

        getSimpleTimeStr: function () {
            if (!this.simpleStartTime || !this.simpleEndTime) {
                return "";
            }
            /*
            GO-35485 moment는 자동으로 브라우저의 타임존에 맞게 시간을 바꾸어준다.
            결재의 신청 내역인 경우 히스토리성 데이터이기 때문에 서버 데이터 그대로 보여준다
             */
            return this.simpleStartTime + "~" + this.simpleEndTime;
        },

        bindEvent: function () {
            self = this;
            this.$startDateEl.on("change", function (e) {
                self.startDate = GO.util.customDate(self.$startDateEl.val().split("(")[0], "YYYY-MM-DD");
                self.refreshTime();
            });

            $('[data-select-type="hour"]').on("change", function (e) {
                setHourValue(e);
                self.refreshTime();
            });
            $('[data-select-type="minute"]').on("change", function (e) {
                setMinuteValue(e)
                self.refreshTime();
            });

            function setHourValue(e) {
                var $target = $(e.currentTarget);
                if ($target.parent('span').parent('span').attr('id') == "startTime") {
                    self.startHour = $target.val();
                } else {
                    self.endHour = $target.val();
                }
            }

            function setMinuteValue(e) {
                var $target = $(e.currentTarget);
                if ($target.parent('span').parent('span').attr('id') == "startTime") {
                    self.startMinute = $target.val();
                } else {
                    self.endMinute = $target.val();
                }
            }

        },

        unBindEvent: function () {
            /*  $('#cseltest').off('change');*/
        },
        refreshTime: function () {
            this.isChecked = false;
            this.startTime = moment(this.startDate).hour(this.startHour ? this.startHour : $("#startTime").find('[data-select-type="hour"]').val()).minute(this.startMinute ? this.startMinute : $("#startTime").find('[data-select-type="minute"]').val());
            this.endTime = moment(this.startDate).hour(this.endHour ? this.endHour : $("#endTime").find('[data-select-type="hour"]').val()).minute(this.endMinute ? this.endMinute : $("#endTime").find('[data-select-type="minute"]').val());

            if (this.endTime - this.startTime < 0) {
                this.endTime.add(1, 'days');
            }
            var diffTime = (this.endTime - this.startTime) / 1000;

            var diffHour = parseInt(diffTime / 3600);
            var diffMin = parseInt((diffTime % 3600) / 60);


            this.$totalTimeEl.text(diffHour + "시간 " + diffMin + "분 ");
            this.renderButton();
            this.bindButtonEvent();

        },


        renderEditDocument: function () {
            this.startDate = GO.util.customDate(this.$startDateEl.val().split("(")[0], "YYYY-MM-DD");
            this.bindEvent();
            this.refreshTime();
        },


        bindButtonEvent: function () {
            var self = this;

            var param = {
                drafterId : this.drafterId,
                startDate: this.startDate,
                startTime: this.startTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                endTime: this.endTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            };

            $("#timeCheck").on('click', function () {
                var timelineModel = new TimelineApprovalModel();
                timelineModel.fetch({
                    data: param,
                    async: false,
                    success: function (response) {
                        var data = response.attributes;
                        self.$totalTimeEl.text(data.nowApprovalWorkingTime.workingDetailStr);
                        self.variablesData.monthlyTotalTimeStr = data.monthWorkingTime.totalStr;
                        self.variablesData.weeklyTotalTimeStr = data.weekWorkingTime.totalStr;
                        self.variablesData.weeklyExtensionTimeStr = data.weekWorkingTime.overtimeStr;
                        self.variablesData.monthlyExtensionTimeStr = data.monthWorkingTime.overtimeStr;
                        self.variablesData.approvals = JSON.stringify(data.approvals.filter(function (approval) {
                            return !approval.timeType; // 연차 내역은 보여주지 않음
                        }));
                        self.isChecked = true;

                        self.renderData();
                    },
                    error: function (model, response, options) {
                        $.goError(commonLang["500 오류페이지 타이틀"]);
                        GO.router.navigate("approval", {trigger: true});
                    }
                });

            });
        },


        getVariablesData: function () {
            return {
                startDate: GO.util.customDate(this.$startDateEl.val().split("(")[0], "YYYY-MM-DD"),
                startTime: GO.util.toISO8601(this.startTime),
                endTime: GO.util.toISO8601(this.endTime),
                description: this.$descriptionEl.val(),
                name: this.$approvalNameEl.children('span').find(':checked').data('label'),
            }
        },

        validate: function () {
            var self = this;

            return {
                buttonClick: function () {
                    if (!self.isChecked) {
                        $.goSlideMessage(TimelineLang["날짜설정 후 확인버튼을 눌러주세요."]);
                        return false;
                    }
                    return true;

                },
                descriptionLength: function () {
                	var description = self.$descriptionEl.val();
                	if (!description) {
                        $.goSlideMessage(timelineLang["사유를입력해주세요"]);
                        return false;
                    }
                    //oracle 한글 한자 3byte로 취급 4000/3
                    var descriptionDBColumnMaxLength = 1333;
                    var maxLength = ($(self.$descriptionEl).attr("data-maxlength")) ? parseInt($(self.$descriptionEl).attr("data-maxlength")) : descriptionDBColumnMaxLength;
                    if(maxLength > descriptionDBColumnMaxLength) {
                        maxLength = descriptionDBColumnMaxLength;
                    }
                    var isOverMaxLength = description
                        && (description.length > maxLength);
                    if (isOverMaxLength) {
                        if(maxLength === descriptionDBColumnMaxLength) {
                            maxLength = "(4000byte)1333";
                        }
                        $.goSlideMessage(GO.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], "arg1", maxLength));
                        return false;
                    }
                    return true;
                },
                selectApprovalName: function () {
                    if (!self.$approvalNameEl.children('span').find(':checked').data('label')) {
                        $.goSlideMessage(TimelineLang["근무 구분을 선택하여 주십시오."]);
                        return false;
                    }
                    return true;
                }
            }
        }
    });

    return Timeline;
})
