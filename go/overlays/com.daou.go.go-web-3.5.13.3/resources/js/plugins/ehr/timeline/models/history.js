define("timeline/models/history", function(require){
    var Backbone = require("backbone");
    var GO = require("app");
    
    var HistoryModel = Backbone.Model.extend({
        url :function(){
        	return GO.contextRoot + "api/ehr/timeline/history" + (this.isNew() ? "" : "/" + this.get("id")) + "?" + "userId=" + this.get("targetUserId") + "&baseDate=" + this.get("baseDate");
        },
        requestInfo: {},
        getId:function(){
            return this.get('id')   ;
        },
        getCheckTime : function() {
            return GO.util.convertWithDataTimeZone(this.get("checkTime"));
        },
        checkTimeDate : function(baseDate) {
    		return this.getCheckTime().format("YYYY-MM-DD");
        },
        checkTimeHour : function(){
            return this.getCheckTime().format("HH");
        },
        checkTimeMinute : function() {
            return this.getCheckTime().format("mm");
        },
        checkTimeHourMinuteSecond : function(){
            return this.getCheckTime().format("HH:mm:ss")
        },
        isRenderProgressBar:function(){
            return this.get('viewProgressBar');
        },

        isClockOut:function(){
            return this.getStatus().timelineCode == 'defaultClockOut';
        },
        isClockIn:function(){
            return this.getStatus().timelineCode == 'defaultClockIn';
        },
        checkTime24:function(){
            var date = new Date(this.get('checkTime'));
            var time = date.getHours() * 1000 * 60 * 60 ;
            time += date.getMinutes() * 1000 * 60 ;
            time += date.getSeconds() * 1000 ;
            return new Date(time);
        },
        getStatusName : function() {
        	return this.getStatus().name;
        },
        getStatusId : function() {
            return this.getStatus().id;
        },
        getStatus : function(){
            return this.get("timelineStatus");
        },
        isCheckTimeHour : function(hour){
            return this.getCheckTime().format("HH") == hour;
        },
        isDefaultType:function(){
            return this.getStatus().defaultStatus;
        },
        isCheckTimeMinute : function(minute) {
            return this.getCheckTime().format("mm") == minute;
        },
        isBefore:function(hour, min,sec){
            var time = (hour * 1000 * 60 * 60 ) + ( min * 1000 * 60 ) + ( sec * 1000);
            return time >= this.checkTime24()
        },
        isAfter:function(hour, min, sec){
            var time = (hour * 1000 * 60 * 60 ) + ( min * 1000 * 60 ) + ( sec * 1000);
            return time <= this.checkTime24()
        },
        isNightWork : function() {
        	return this.get("isNightWork");
        },
        getContent : function(){
            return this.get("content");
        },
        getRequestInfo: function () {
            return this.requestInfo;
        }
    });

    return HistoryModel;
});