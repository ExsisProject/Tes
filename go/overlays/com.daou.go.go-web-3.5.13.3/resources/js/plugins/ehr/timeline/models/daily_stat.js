
define("timeline/models/daily_stat", function (require) {

    var Backbone = require("backbone");
    var GO = require("app");
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var HistoryModel = require("timeline/models/history");

	var DailyStat= Backbone.Model.extend({
		defaults : {
        },
            
        initialize : function(){
            this.user = this.get("user");
            this.approvals = this.get('timelineApprovals');
            this.historyModels = _.chain(this.get("timelineHistories"))
                .map(function(history){return new HistoryModel(history);})
                .value();

            this.timelineGroup = this.get('timelineGroup');
            this.detailDay = this.get('detailDay');
            this.day = this.detailDay.day;
            if( this.timelineGroup) {
                this.workingStartTime = this.timelineGroup.workingStartTime;
                this.workingEndTime = this.timelineGroup.workingEndTime;
                this.workingStartDate = Date.parse(this.day + " " + this.workingStartTime)
                this.workingEndDate = Date.parse(this.day + " " + this.workingEndTime)
                this.zeroPoint = Date.parse(this.day + ' 00:00:00') ;
            }
            this.timelineViewModels = this.get('timelineViewModels');

        },
        isWorkingTime:function(hour){
		    if( !this.timelineGroup){
		        return true;
            }

		    var hourTime = this.zeroPoint + ( hour * 60 * 60 * 1000);
		    return hourTime <= this.workingEndDate && hourTime >= this.workingStartDate;
        },
        getClockInTime:function(){
            var clockInTime = this.get('clockInTime');
            return clockInTime ? clockInTime : '';
        },
        getClockInGpsLink:function(){
           return this.get("clockInHistory").gpsLink;
        },
        getClockOutGpsLink:function(){
            return this.get("clockOutHistory").gpsLink;
        },
        getClockOutTime:function(){
            var clockOutTime = this.get('clockOutTime');
            if(!clockOutTime){
                return '';
            }

            var clockOutCheckTime = this.get("clockOutHistory").checkTime;

            if(moment(clockOutCheckTime).format("YYYY-MM-DD") != this.get("detailDay").day){
                clockOutTime += " (+1)";
            }

            return clockOutTime;
        },

        getPositioinName: function(){
           return  this.user.name + ' ' + this.user.position;
        },
        getTotalWorkingTime:function(){
		    return this.get("workingTime").totalStr;
        },
        convertMilliToHour:function(ms){
            return (ms / 60.0 / 60.0/ 1000.0).toFixed(1) ;
        },
        getNormalWorkingTime:function(){
            return this.get("workingTime").normalStr;
        },
        getExtensionWorkingTime:function(){
            return this.get("workingTime").extensionStr;
        },
        getNightWorkingTime:function(){
            return this.get("workingTime").nightStr;
        },
        getApprovals:function(){
		    var approvalViews = [];

		    for ( var i = 0 , approval; approval = this.approvals[i]; i ++) {
                if (!approval.name) { continue; }

		        var timeCalType = approval.timeType;
                var approvalStatus = TimelineLang[approval.approvalStatus];

                var time;
		        if(timeCalType) {
		            time = approval.hours + 'h';
                } else {
                    var startTime = approval.simpleStartTime;
                    var endTime = approval.simpleEndTime;
                    time = startTime + " ~ " + endTime;
                }
                var message = approvalStatus + ' (' + approval.name + ' ' + time + ')';
                approvalViews[approvalViews.length] = ( {name : approval.name , agree : approval.agree, startTime: startTime , endTime : endTime , message:message}  )
            }
            return approvalViews;
        },
        getTimelineHistories : function() {
        	return this.get("timelineHistories")
        },
        getDayOfWeek : function(){
		    return this.get("detailDay")["timelineDayOfWeek"];
        },

        hasTotalWorkingTime : function(){
            if(this.get("total") != 0){
                return true;
            }

            return false;
        },
        getWorkingTimeDetail : function(){
            return this.get("workingTime").workingDetailStr;
        },
        isEditedWorkInTime : function(){
		    return this.isEditedStatus("defaultClockIn");
        },
        isEditedWorkOutTime : function(){
            return this.isEditedStatus("defaultClockOut");
        },
        isEditedStatus : function(statusCode){
            return _.chain(this.get("timelineHistories"))
                .filter(function(data){
                    return data["timelineStatus"]["timelineCode"] == statusCode;
                })
                .map(function(data){
                    return data["editedCheckTime"];
                }).value()[0];
        },
        isToday : function(){
		    return this.get("detailDay")["today"];
        },
        findHistoriesByHour : function(leftTime, rightTime){
		    return _.chain(this.historyModels)
                .filter(function(historyModel){
                    return  leftTime.getTime() <= historyModel.checkTime24() && historyModel.checkTime24() < rightTime.getTime() ;
                }).value();
        },
        getTimelineHistoriesSortByCheckTime : function() {
            return _.sortBy(this.get("timelineHistories"), "checkTime");
        }
	});

	return DailyStat;
	
});
