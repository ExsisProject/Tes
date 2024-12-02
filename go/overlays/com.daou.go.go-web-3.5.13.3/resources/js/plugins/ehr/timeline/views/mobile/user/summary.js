define("timeline/views/mobile/user/summary", function(require){

    var Backbone = require("backbone");
    var GO = require("app");

    var SummaryModel = require("timeline/models/summary");

    var Tmpl = require("hgn!timeline/templates/mobile/user/summary");
    var SelectiveTypeTmpl = require("hgn!timeline/templates/mobile/user/selective_type_summary");
    
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

    var SummaryView = Backbone.View.extend({
        className : "wrap_statistics",
        unbindEvent : function() {
            this.$el.off('vclick', '#summaryArrow');
        },
        bindEvent : function() {
            this.$el.on('vclick', '#summaryArrow', $.proxy(this.clickSummaryArrow, this));
        },
        initialize : function(options){
            this.options = options;
            console.log(this.options);
            this.model = new SummaryModel(options);
            this.baseDate = options.baseDate;
            this.userId = options.userId;
        },

        render : function(baseDate) {
            this.model.fetch({async: false});
            this.unbindEvent();
            this.bindEvent();
            var isSelectiveWorkingType = this.model.month.isSelectiveWorkingType();
            if (isSelectiveWorkingType) {
                this.$el.html(SelectiveTypeTmpl(this.getSelectiveTypeData()));
                $('#summary').removeClass('wrap_summary');
            } else {
                this.$el.html(Tmpl(this.getNonSelectiveTypeData()));
            }
            this.baseDate = baseDate;
        },

        clickSummaryArrow: function(e){
            var $target = $(e.currentTarget);
            $target.find("span").removeClass();
            if($(".expandArea").css("display") === "none"){
                $target.find("span").addClass("ic_arrow_up1");
                $(".expandArea").show();
            } else {
                $target.find("span").addClass("ic_arrow_down1");
                $(".expandArea").hide();
            }
        },
        getNonSelectiveTypeData : function() {
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
                remainMaximumWorkingTime:this.model.month.selectiveWorkingTime.getRemainingMaximumWorkingTime()
            }
        },

        getSelectiveTypeData : function() {
            var selectiveWorkingTime = this.model.getSelectiveWorkingTime();
            var monthWorkingTime = this.model.getMonthWorkingTime();
            var Lang = {
                '선택적근로제 근무가능시간 설명' : GO.i18n(TimelineLang['선택적근로제 근무가능시간 설명'], {
                    arg1 : selectiveWorkingTime.maximumExtensionWorkingTimeStr}),
                '오늘최소근무시간 안내' : GO.i18n(TimelineLang['오늘까지최소근무시간안내'],
                    {arg1 : selectiveWorkingTime.todayMinimumTotalWorkingTimeStr}),
            };
            return {
                CommonLang : CommonLang,
                TimelineLang : TimelineLang,
                Lang : Lang,

                월 : this.model.getMM(),

                총근무Hour : monthWorkingTime.totalDetail.hour,
                총근무Min : monthWorkingTime.totalDetail.min,
                총근무Sec : monthWorkingTime.totalDetail.sec,

                월최소근무시간 : selectiveWorkingTime.minimumTotalWorkingTimeStr,
                월최대근무시간 : selectiveWorkingTime.maximumTotalWorkingTimeStr,
                월연장최대시간: selectiveWorkingTime.maximumExtensionWorkingTimeStr,

                잔여근무최소 : selectiveWorkingTime.remainMinimumWorkingTimeStr,
                잔여근무최대 : selectiveWorkingTime.remainMaximumWorkingTimeStr,
                잔여평균근무 : selectiveWorkingTime.averageMinimumWorkingTimeStr,
                잔여연장근무 : selectiveWorkingTime.remainExtensionWorkingTimeStr,
                남은근무일: selectiveWorkingTime.furtureWorkingDayCnt,

                선택근무시간 : selectiveWorkingTime.normalWorkingTimeStr,
                초과근무시간 : selectiveWorkingTime.normalOverWorkingTimeStr,
                승인근무시간 : selectiveWorkingTime.extensionWorkingTimeStr,

                // Graph용
                금일최소근무율: selectiveWorkingTime.rate.todayMinimumWorkingTimeRate,
                월최소근무율 : selectiveWorkingTime.rate.minimumWorkingTimeRate,
                선택근무율 : selectiveWorkingTime.rate.tunedNormalWorkingTimeRate,
                초과근무율 : selectiveWorkingTime.rate.tunedNormalOverWorkingTimeRate,
                승인근무율 : selectiveWorkingTime.rate.tunedExtensionWorkingTimeRate,
            }
        },

        changeBaseDate: function (baseDate) {
            this.baseDate = baseDate;
            this.model.baseDate = moment(this.baseDate, "YYYY-MM-DD").format("YYYY-MM-DD");
            this.render();
        }
    });

    return SummaryView;
});