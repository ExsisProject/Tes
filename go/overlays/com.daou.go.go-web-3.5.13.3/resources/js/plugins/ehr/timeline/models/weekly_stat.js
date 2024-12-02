
define("timeline/models/weekly_stat", function (require) {

    var Backbone = require("backbone");
    var DailyStats = require("timeline/collections/daily_stats");
    var BASE_WEEK_WORKING_TIME = 1000 * 60 * 60 * 40;
	var WeekStat= Backbone.Model.extend({
		defaults : {
        },

        initialize : function(){
            this.user = this.get("user");
            this.group = this.get("timelineGroup");
            if(this.get("dailyList")) {
                this.dailyList = new DailyStats(this.get("dailyList"));
            }
        },
        getUser:function(){
            return this.user;
        },
        getGroup:function(){
            return this.group;
        },
        getPositioinName: function(){
           return  this.user.name + ' ' + this.user.position;
        },
        getName: function() {
        	return  this.user.name; 
        },
        getPosition: function() {
        	return this.user.position;
        },
        getDeptName: function() {
        	return this.user.deptName;
        },
        getTotalWorkingTime:function(){
            return this.get("workingTime").totalStr;
        },
        isOverTotalWorkingTime : function() {
            return this.get("workingTime").total - this.get("workingTime").limitTime > 0;
        },
        getExtensionWorkingTimeStr : function(){
            return this.get("workingTime").overtimeStr;
        },
        getRestWorkingTime:function(){
            return this.get("workingTime").restTimeStr;
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
        getFirstDay:function(){
            return this.get("firstDay");
        },
        getLastDay:function(){
            return this.get("lastDay");
        },
    });
    

	return WeekStat;
	
});
