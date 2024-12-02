define("timeline/views/user/summary", function (require) {

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/summary");
    var SelectiveTypeTmpl = require("hgn!timeline/templates/user/selective_type_summary");
    var SummaryModel = require("timeline/models/summary");
    var IntegrationApprLinkModel = require("timeline/models/integration_appr_link");
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var GO = require("app");
    var BackdropView = require('components/backdrop/backdrop');

    var SummaryView = Backbone.View.extend({
        events: {
            "click #download": "download",
            "click #overtime": "overtime",
            "click #timeline_info": "toggleTimelineInfoDesc",
            "click #selectiveTimeToolTipBtn": "toggleSelectiveTimeToolTip",
            "click #overTimeToolTipBtn": "toggleOverTimeToolTip",
            "click #approvalTimeToolTipBtn": "toggleApprovalTimeToolTip",

        },
        className: "wrap_statistics",

        initialize: function (options) {
            this.options = options;
            this.model = new SummaryModel(options);
            this.apprLinkModel = new IntegrationApprLinkModel(options);
            this.apprLinkModel.fetch({async: false});
            this.baseDate = options.baseDate;
            this.userId = options.userId;
        },

        render: function () {
            this.model.fetch().done(_.bind(function () {
                this.groupHistories = this.model.month.groupHistories;
                var isSelectiveWorkingType = this.model.month.isSelectiveWorkingType();
                if (isSelectiveWorkingType) {
                    this.$el.html(SelectiveTypeTmpl(this.getSelectiveTypeData()));
                } else {
                    this.$el.html(Tmpl(this.getNonSelectiveTypeData()));
                }
            }, this))
        },

        getNonSelectiveTypeData: function () {
            return {
                CommonLang: CommonLang,
                TimelineLang: TimelineLang,
                weekTotalWorkingTime: this.model.getWeekTotalWorkingTime(),
                weekExtensionWorkingTime: this.model.getWeekExtensionWorkingTime(),
                weekRestWorkingTime: this.model.getWeekRestWorkingTime(),
                monthTotalWorkingTime: this.model.getMonthTotalWorkingTime(),
                monthTotalApprovalTime: this.model.getMonthExtentionWorkingTimeStr(),
                groupName: this.model.getGroupName(),
                groupDesc: this.model.getGroupDesc(),
                restPeriods: this.model.getRestPeriods(),
                nightWorkingTime: this.model.getNightWorkingTime(),
                workingTimeRange: this.model.getWorkingTimeRange(),
                isOverTotalWorkingTime: this.model.isOverTotalWorkingTime(),
                canApplyOvertimeAppr: this.apprLinkModel.canApplyOvertimeAppr(),
                remainMaximumWorkingTime: this.model.month.selectiveWorkingTime.getRemainingMaximumWorkingTime(),
                groupHistories: this.groupHistories,
                isFlexibleWorkingType: this.model.month.isFlexibleWorkingType()
            }
        },

        getSelectiveTypeData: function () {
            var selectiveWorkingTime = this.model.getSelectiveWorkingTime();
            var monthWorkingTime = this.model.getMonthWorkingTime();
            var Lang = {
                '선택적근로제 근무가능시간 설명': GO.i18n(TimelineLang['선택적근로제 근무가능시간 설명'],
                    {arg1: selectiveWorkingTime.maximumExtensionWorkingTimeStr}),
                '최소근무시간 안내': GO.i18n(TimelineLang['총 최소근무시간 안내'],
                    {arg1: this.model.getMM(), arg2: selectiveWorkingTime.minimumTotalWorkingTimeStr}),
                '최대근무시간 안내': GO.i18n(TimelineLang['총 최대근무시간 안내'],
                    {arg1: this.model.getMM(), arg2: selectiveWorkingTime.maximumTotalWorkingTimeStr}),
                '오늘최소근무시간 안내': GO.i18n(TimelineLang['오늘까지최소근무시간안내'],
                    {arg1: selectiveWorkingTime.todayMinimumTotalWorkingTimeStr}),
            };
            return {
                CommonLang: CommonLang,
                TimelineLang: TimelineLang,
                Lang: Lang,

                월: this.model.getMM(),

                총근무Hour: monthWorkingTime.totalDetail.hour,
                총근무Min: monthWorkingTime.totalDetail.min,
                총근무Sec: monthWorkingTime.totalDetail.sec,

                월최소근무시간: selectiveWorkingTime.minimumTotalWorkingTimeStr,
                월최대근무시간: selectiveWorkingTime.maximumTotalWorkingTimeStr,
                월연장최대시간: selectiveWorkingTime.maximumExtensionWorkingTimeStr,

                잔여근무최소: selectiveWorkingTime.remainMinimumWorkingTimeStr,
                잔여근무최대: selectiveWorkingTime.remainMaximumWorkingTimeStr,
                잔여평균근무: selectiveWorkingTime.averageMinimumWorkingTimeStr,
                잔여연장근무: selectiveWorkingTime.remainExtensionWorkingTimeStr,
                남은근무일: selectiveWorkingTime.furtureWorkingDayCnt,

                선택근무시간: selectiveWorkingTime.normalWorkingTimeStr,
                초과근무시간: selectiveWorkingTime.normalOverWorkingTimeStr,
                승인근무시간: selectiveWorkingTime.extensionWorkingTimeStr,

                // Graph용
                금일최소근무율: selectiveWorkingTime.rate.todayMinimumWorkingTimeRate,
                월최소근무율: selectiveWorkingTime.rate.minimumWorkingTimeRate,
                선택근무율: selectiveWorkingTime.rate.tunedNormalWorkingTimeRate,
                초과근무율: selectiveWorkingTime.rate.tunedNormalOverWorkingTimeRate,
                승인근무율: selectiveWorkingTime.rate.tunedExtensionWorkingTimeRate,

                canApplyOvertimeAppr: this.apprLinkModel.canApplyOvertimeAppr(),
                restPeriods: this.model.getRestPeriods(),
                nightWorkingTime: this.model.getNightWorkingTime(),
                workingTimeRange: this.model.getWorkingTimeRange(),
                groupDesc: this.model.getGroupDesc(),
                groupName: this.model.getGroupName(),
                groupHistories: this.groupHistories,
            }
        },


        toggleTimelineInfoDesc: function () {
            this._bindBackdrop(this.$("#timeline_info_desc"), this.$("#timeline_info"));
        },

        toggleSelectiveTimeToolTip: function () {
            if (!this.selectiveTimeToolTipBackdropView) {
                this.selectiveTimeToolTipBackdropView = this._bindBackdrop(this.$("#selectiveTimeToolTip"), this.$("#selectiveTimeToolTipBtn"));
            }
        },

        toggleOverTimeToolTip: function () {
            if (!this.overTimeToolTipBackdropView) {
                this.overTimeToolTipBackdropView = this._bindBackdrop(this.$("#overTimeToolTip"), this.$("#overTimeToolTipBtn"));
            }
        },

        toggleApprovalTimeToolTip: function () {
            if (!this.approvalTimeToolTipBackdropView) {
                this.approvalTimeToolTipBackdropView = this._bindBackdrop(this.$("#approvalTimeToolTip"), this.$("#approvalTimeToolTipBtn"));
            }
        },

        _bindBackdrop: function ($el, $link) {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = $el;
            backdropView.linkBackdrop($link);
            return backdropView;
        },

        changeBaseDate: function (baseDate) {
            this.baseDate = baseDate;
            this.model.baseDate = moment(this.baseDate, "YYYY-MM-DD").format("YYYY-MM-DD");
            this.render();
        },

        overtime: function () {
            var url = "/approval/document/new/";
            var deptId = this.apprLinkModel.getDeptId();
            var formId = this.apprLinkModel.getFormId();
            var writeMode = this.apprLinkModel.getWriteMode();

            if (writeMode == 'POPUP') {
                url = GO.contextRoot + 'app' + url + 'popup' + '/' + deptId + '/' + formId;
                window.open(url, '', 'location=no, directories=no, resizable=yes, status=no, toolbar=no, menubar=no, width=1280, height=650, left=0, top=0, scrollbars=yes');
            } else {
                url += (deptId + '/' + formId);
                GO.router.navigate(url, {trigger: true});
                $('html, body').animate({
                    scrollTop: 0
                });
            }
        },

        download: function () {
            window.location.href = GO.contextRoot + "api/ehr/timeline/excel?" + $.param({
                userId: this.userId,
                baseDate: moment(this.baseDate, "YYYY-MM-DD").format("YYYY-MM-DD")
            });
        }
    });

    return SummaryView;
});
