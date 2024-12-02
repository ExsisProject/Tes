define(function (require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var _ = require('underscore');

    var TimelineApprovalModel = require('approval/daouform/timeline_2580/models/timelineApproval');
    var RequestApprovalModel = require('approval/daouform/timeline_2580/models/requestApproval');
    var RequestApprovalCollection = require('approval/daouform/timeline_2580/models/requestApprovals');

    var commonLang = require('i18n!nls/commons');
    var timelineLang = require("i18n!timeline/nls/timeline");

    var PrevApprovalsTpl = require('hgn!approval/daouform/timeline_2580/templates/previousApproval');
    var CrntApprovalsTpl = require('hgn!approval/daouform/timeline_2580/templates/currentApproval');
    var WorkingTimeTpl = require('hgn!approval/daouform/timeline_2580/templates/workingTime');

    var Timeline = Backbone.View.extend({
        el: '#document_content',

        events: {
            'click #timelineApprovalAddBtn': 'addTimelineApproval',
            'click #timelineApprovalDelBtn': 'delTimelineApproval',
            'change #startTime [data-select-type=hour]': 'refreshTime',
            'change #startTime [data-select-type=minute]': 'refreshTime',
            'change #endTime [data-select-type=hour]': 'refreshTime',
            'change #endTime [data-select-type=minute]': 'refreshTime',
        },

        initialize: function (options) {
            this.$el = $(this.el);
            this.$timelineApprovalFormEl = this.$el.find('#timelineApprovalFormSection');
            this.$timelineApprovalDetailsEl = this.$el.find('#timelineApprovalDetailsSection');

            this.isChecked = false;
            this.$startDateEl = this.$el.find('#startDate');
            this.$startTimeHourEl = this.$el.find('#startTime [data-select-type="hour"]');
            this.$endTimeHourEl = this.$el.find('#endTime [data-select-type="hour"]');
            this.$totalTimeEl = this.$el.find('#totalTime');
            this.$approvalNameEl = this.$el.find('#name');
            this.$descriptionEl = this.$el.find('#description');
            this.variablesData = options.variables;

            this.prevApprovals = [];
            this.requestApprovals = new RequestApprovalCollection();
            this.requestApprovals.convertJsonToCollection({data: this.variablesData.requestApprovals});
            this.drafterId = options.docModel.drafterId;
            this.prevRequestApprovalIds = [];

            if (this.variablesData.prevRequestApprovals) {
                this.prevRequestApprovalIds = JSON.parse(this.variablesData.prevRequestApprovals).map(function (approval) {
                    return approval.approvalId;
                })
            }
            this.addDataOption();
        },

        render: function () {
            this.$startDateEl.datepicker("setDate", new Date());
            this.renderData();
        },

        addDataOption: function () {
            var option = "<option value='24'>24</option>";
            var optionHelpMessage = "<span style='font-size: 12px;'>* " + timelineLang["결재 근무시간 도움말"] + "</span>"
            this.$startTimeHourEl.append(option);
            this.$endTimeHourEl.append(option);
            this.$approvalNameEl.append(optionHelpMessage);
        },

        renderData: function () {
            var _self = this;
            this.$timelineApprovalDetailsEl.html('');

            renderCurrentApprovals();
            renderPrevApprovals();

            function renderCurrentApprovals() {
                var output = CrntApprovalsTpl({data: _self.requestApprovals.toJSON()});
                _self.$timelineApprovalDetailsEl.append(output);
            }

            function renderPrevApprovals() {
                var prevApprovals = _self.prevApprovals
                    .reduce(function (array, value, index) {   //중복 제거
                        if (array.map(function (approval) {
                            return approval.id;
                        }).indexOf(value.id) < 0) array.push(value);
                        return array;
                    }, [])
                    .filter(function (approval) {
                        return _self.prevRequestApprovalIds.indexOf(approval.id) < 0;
                    })
                    .map(function (approval) {
                        approval.workingTimeRange = _self.getSimpleTimeStr(approval);
                        return approval;
                    });

                var output = PrevApprovalsTpl({
                    data: prevApprovals
                });
                _self.$timelineApprovalDetailsEl.append(output);
            }
        },

        addTimelineApproval: function () {
            var param = {
                drafterId: this.drafterId,
                startDate: GO.util.customDate(this.$startDateEl.val().split("(")[0], "YYYY-MM-DD"),
                startTime: GO.util.toISO8601(this.getStartTimeMoment()),
                endTime: GO.util.toISO8601(this.getEndTimeMoment()),
            };

            var timelineModel = new TimelineApprovalModel();
            timelineModel.fetch({
                data: param,
                async: false,
                success: $.proxy(function (response) {
                    var data = response.attributes;
                    this.isChecked = true;

                    var requestApproval = new RequestApprovalModel({
                        workingDay: param.startDate,
                        startTime: param.startTime,
                        endTime: param.endTime,
                        timeRange: this.getTimeStr(param.startTime, param.endTime),
                        reasons: this.$descriptionEl.val(),
                        reasonsMaxLength: this.$descriptionEl.attr("data-maxlength"),
                        name: this.$approvalNameEl.children('span').find(':checked').data('label'),
                        totalTime: data.nowApprovalWorkingTime.workingDetailStr,
                        weeklyTotalTimeStr: data.weekWorkingTime.totalStr,
                        weeklyExtensionTimeStr: data.weekWorkingTime.extensionStr,
                        monthlyTotalTimeStr: data.monthWorkingTime.totalStr,
                        monthlyExtensionTimeStr: data.monthWorkingTime.extensionStr,
                        normalTimeStr: data.nowApprovalWorkingTime.normalStr,
                        extensionStr: data.nowApprovalWorkingTime.extensionStr,
                        nightTimeStr: data.nowApprovalWorkingTime.nightStr,
                    });
                    // 연차 내역은 보여주지 않음
                    this.prevApprovals = this.prevApprovals.concat(data.approvals
                        .filter(function (approval) {
                        return !approval.timeType;
                    }));
                    this.requestApprovals.add(requestApproval);
                    this.renderData();
                }, this),
                error: function (model, response) {
                    if (response.responseJSON && response.responseJSON.message) {
                        $.goError(response.responseJSON.message);
                    } else {
                        $.goError(commonLang["500 오류페이지 타이틀"]);
                    }
                }
            });
        },

        delTimelineApproval: function () {
            var removedApproval = this.requestApprovals.pop();
            if (!removedApproval) {
                return;
            }
            var removedDateFormat = moment(removedApproval.attributes.workingDay).format('YYYY-MM');
            var hasRemovedMonth = this.requestApprovals //지워진 approval의 해당 월이 신청 내역에 존재하는지
                .map(function (approval) {
                    return moment(approval.attributes.workingDay).format('YYYY-MM');
                }).filter(function (approvalDateFormat) {
                    return approvalDateFormat === removedDateFormat;
                }).length > 0;
            if (!hasRemovedMonth) { //이전 승인요청 내역에서 해당 월 제거
                this.prevApprovals = this.prevApprovals.filter(function (approval) {
                    return moment(approval.baseDate).format('YYYY-MM') !== removedDateFormat;
                })
            }
            this.renderData();
        },

        getSimpleTimeStr: function(approval){
            if (!approval.simpleStartTime || !approval.simpleEndTime) {
                return "";
            }
            return approval.simpleStartTime + "~" + approval.simpleEndTime;
        },

        getTimeStr: function (startTime, endTime) {
            if (!startTime || !endTime) {
                return "";
            }
            /*
            GO-35485 moment는 자동으로 브라우저의 타임존에 맞게 시간을 바꾸어준다.
            결재의 신청 내역인 경우 히스토리성 데이터이기 때문에 서버 데이터 그대로 보여준다
            */
            return startTime.slice(11,16) + "~" + endTime.slice(11,16);

        },

        refreshTime: function () {
            var startTime = this.getStartTimeMoment();
            var endTime = this.getEndTimeMoment();

            var diffTime = (endTime - startTime) / 1000;

            var diffHour = parseInt(diffTime / 3600);
            var diffMin = parseInt((diffTime % 3600) / 60);

            this.$totalTimeEl.text(diffHour + "시간 " + diffMin + "분 ");
        },

        getStartTimeMoment: function () {
            var self = this;
            var startDate = GO.util.customDate(this.$startDateEl.val().split("(")[0], "YYYY-MM-DD");
            var hour = self.$timelineApprovalFormEl.find('#startTime [data-select-type=hour]').val();
            var minute = self.$timelineApprovalFormEl.find('#startTime [data-select-type=minute]').val();

            var startTime = moment(startDate).hour(hour).minute(minute);
            if (startTime.hour() == "24") {
                startTime.add(1, 'days');
            }

            return startTime;
        },

        getEndTimeMoment: function () {
            var self = this;
            var startDate = GO.util.customDate(this.$startDateEl.val().split("(")[0], "YYYY-MM-DD");
            var hour = self.$timelineApprovalFormEl.find('#endTime [data-select-type=hour]').val();
            var minute = self.$timelineApprovalFormEl.find('#endTime [data-select-type=minute]').val();

            var startTime = this.getStartTimeMoment();
            var endTime = moment(startDate).hour(hour).minute(minute);
            if (endTime - startTime < 0) {
                endTime.add(1, 'days');
            }
            return endTime;
        },

        getVariablesData: function () {
            return {requestApprovals: this.requestApprovals.convertCollectionToJson()};
        },

        validate: function() {
            var self = this;
            return {
                checkEmptyRequestApprovals: function() {
                    if (self.requestApprovals.length == 0) {
                        $.goSlideMessage(timelineLang["신청내역 체크 메세지"]);
                        return false;
                    }
                    return true;
                }
            }
        }
    });

    return Timeline;
})
