define("timeline/models/dashboard/dashboard_stat", function (require) {

    var Backbone = require("backbone");

    var DashboardStat = Backbone.Model.extend({
        initialize: function () {
            this.user = this.get("user");
            this.detailDay = this.get("detailDay");
            this.clockIn = this.get("clockIn");
            this.clockInTime =  this.clockIn ?  moment(this.get("clockInTime")).format('HH:MM:SS') : undefined;
            this.clockInTimeStr =  this.get('clockInTimeStr');
            this.editClockIn = this.get('editClockIn');
            this.clockInWarning= this.get('clockInWarning');

            this.editClockOut = this.get('editClockOut');
            this.clockOutWarning= this.get('clockOutWarning');

            this.clockOut = this.get("clockOut");
            this.clockOutTime =  this.clockOut ?  moment(this.get("clockOutTime")).format('HH:MM:SS') : undefined;
            this.clockOutTimeStr =  this.get('clockOutTimeStr');
            this.vacations = this.get("vacations");
            this.tardy = this.get("tardy");
            this.early = this.get("early");
            this.absence= this.get('absence')
            this.lateClockOut = this.get("lateClockOut");
            this.autoClockOut = this.get("autoClockOut");
            this.etcStatus = this.get('etcStatus');
            this.extensionTime = this.get('extensionTimeStr');
            this.etcStatusStr = this.get('etcStatusStr');
            this.nightTime= this.get('nightTimeStr');
            this.holyDayTime = this.get('holyDayTimeStr');
            this.totalTime = this.get('totalTimeStr');
            this.vacationStr = this.get('vacationStr')
            this.unAuthDeviceStr = this.get('unAuthDeviceStr');
            this.groupName = this.get('groupName');
            this.overDay = this.get('overDay');

            this.new = this.get('new');
        },

    });

    return DashboardStat;

});