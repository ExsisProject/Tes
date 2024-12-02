define("timeline/models/month_stat", function (require) {

    var Backbone = require("backbone");
    var WeeklyStats = require("timeline/collections/weekly_stats");
    var SelectiveWorkingTime = require("timeline/models/selective_working_time");

    var MonthStat = Backbone.Model.extend({
        defaults: {},

        initialize: function () {
            this.user = this.get("user");
            this.group = this.get("timelineGroup");
            this.weeklyList = new WeeklyStats(this.get("weekList"));
            this.workingType = this.group.workingType;
            this.selectiveWorkingTime = this.isSelectiveWorkingType() ? new SelectiveWorkingTime(this.get("selectiveWorkingTime")) : new SelectiveWorkingTime({});
            this.groupHistories = this.get('groupHistories');
        },
        getSelectiveWorkingTime:function(){
          return this.selectiveWorkingTime.attributes;
        },
        isSelectiveWorkingType: function () {
            return this.workingType == 'SELECTIVE_WORKING_TIME';
        },
        isFlexibleWorkingType: function () {
            return this.workingType == 'FLEXIBLE_WORKING_TIME';
        },
        getUser: function () {
            return this.user;
        },
        getGroup: function () {
            return this.group;
        },
        getPositioinName: function () {
            return this.user.name + ' ' + this.user.position;
        },
        getName: function () {
            return this.user.name;
        },
        getPosition: function () {
            return this.user.position;
        },
        getDeptName: function () {
            return this.user.deptName;
        },
        getTotalWorkingTime: function () {
            return this.get("workingTime").totalStr;
        },
        getExtentionWorkingTimeStr: function () {
            return this.get("workingTime").overtimeStr;
        },
        convertMilliToHour: function (ms) {
            return (ms / 60.0 / 60.0 / 1000.0).toFixed(1);
        },
        getNormalWorkingTime: function () {
            return this.get('workingTime').normalStr;
        },
        getExtensionWorkingTime: function () {
            return this.get('workingTime').extensionStr;
        },
        getNightWorkingTime: function () {
            return this.get('workingTime').nightStr;
        }

    });

    return MonthStat;

});
