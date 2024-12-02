define("timeline/models/summary", function (require) {

    var Backbone = require("backbone");
    var WeekModel = require("timeline/models/weekly_stat");
    var MonthModel = require("timeline/models/month_stat");
    var GroupModel = require("admin/models/ehr/timeline/group");

    var SummaryModel = Backbone.Model.extend({

        initialize: function (param) {
            this.userId = param.userId;
            this.baseDate = param.baseDate;
        },
        url: function () {
            return GO.contextRoot + "api/ehr/timeline/summary?" + $.param({'userId': this.userId, 'baseDate':this.baseDate});
        },
        parse: function (data) {
            this.week = new WeekModel(data.week);
            this.month = new MonthModel(data.month);
            this.group = new GroupModel(data.group);
        },

        getWeekTotalWorkingTime: function () {
            return this.week.getTotalWorkingTime();
        },

        getWeekExtensionWorkingTime : function() {
            return this.week.getExtensionWorkingTimeStr();
        },

        getWeekRestWorkingTime: function () {
            return this.week.getRestWorkingTime();
        },

        getMonthTotalWorkingTime: function () {
            return this.month.getTotalWorkingTime();
        },

        getMonthExtentionWorkingTimeStr: function () {
            return this.month.getExtentionWorkingTimeStr();
        },

        getGroupName: function () {
            return this.group.get("name");
        },

        getWorkingTimeRange: function () {
            return this.group.getWorkingTimeRange();
        },

        isOverTotalWorkingTime : function () {
            return this.week.isOverTotalWorkingTime();
        },

        getGroupDesc : function() {
            return GO.util.escapeHtml(this.group.get("description"));
        },

        getRestPeriods : function() {
            return this.group.get("restperiods");
        },

        getNightWorkingTime : function() {
            if(!this.group.isFlexibleWorkingTimeType()) {
                return {
                    "startTime" : this.group.getNightStartTime(),
                    "endTime" : this.group.getNightEndTime()
                };
            }else {
                return "";
            }
        },

        getSelectiveWorkingTime : function() {
            var selectiveWorkingTime =  this.month.get('selectiveWorkingTime');
            var rate = getSelectiveWorkingTimeRate(selectiveWorkingTime);
            selectiveWorkingTime.rate.tunedNormalWorkingTimeRate = rate.tunedNormalWorkingTimeRate;
            selectiveWorkingTime.rate.tunedNormalOverWorkingTimeRate = rate.tunedNormalOverWorkingTimeRate;
            selectiveWorkingTime.rate.tunedExtensionWorkingTimeRate = rate.tunedExtensionWorkingTimeRate;

            function getSelectiveWorkingTimeRate(selectiveWorkingTime) {
                var tunedNormalWorkingTimeRate = selectiveWorkingTime.rate.normalWorkingTimeRate;
                var tunedNormalOverWorkingTimeRate = selectiveWorkingTime.rate.normalOverWorkingTimeRate;
                var tunedExtensionWorkingTimeRate = selectiveWorkingTime.rate.extensionWorkingTimeRate;

                var sum = tunedNormalWorkingTimeRate + tunedNormalOverWorkingTimeRate + tunedExtensionWorkingTimeRate;
                if (sum > 100) {
                    if (tunedNormalWorkingTimeRate + tunedNormalOverWorkingTimeRate > 100) {
                        tunedNormalOverWorkingTimeRate = 100 - tunedNormalWorkingTimeRate - 1;
                        tunedExtensionWorkingTimeRate = 1;
                    } else {
                        tunedExtensionWorkingTimeRate = 100 - (tunedNormalWorkingTimeRate+tunedNormalOverWorkingTimeRate);
                    }
                }

                return {
                    tunedNormalWorkingTimeRate : tunedNormalWorkingTimeRate,
                    tunedNormalOverWorkingTimeRate : tunedNormalOverWorkingTimeRate,
                    tunedExtensionWorkingTimeRate : tunedExtensionWorkingTimeRate
                };
            }
            return selectiveWorkingTime;
        },

        getMM : function() {
            var yyyyMM = this.month.get('yyyymm');
            return yyyyMM && yyyyMM.indexOf('-') > 0 ? yyyyMM.split('-')[1] : new Date().getMonth() + 1;
        },

        getMonthWorkingTime : function() {
            return this.month.get('workingTime');
        },

    });

    return SummaryModel;
});
