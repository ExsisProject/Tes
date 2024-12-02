define("admin/models/ehr/timeline/group", function(require){
    var Backbone = require("backbone");
    var GO = require("app");
    var AdminLang = require("i18n!admin/nls/admin");
    var TimelineLang = require("i18n!timeline/nls/timeline");

    var GroupModel = Backbone.Model.extend({
        urlRoot: GO.contextRoot+"ad/api/timeline/group",
        defaults : {
            "workingType" : "FIXED_WORKING_TIME",
            "fixedOption" : {
                "workDay" : "{\"Mon\":true,\"Tue\":true,\"Wed\":true,\"Thu\":true,\"Fri\":true,\"Sat\":false,\"Sun\":false}",
                "workTimeRange" : {
                    "workStartTime": "09:00:00",
                    "workEndTime"  : "18:00:00",
                    "dutyStartTime" : "10:00:00",
                    "dutyEndTime" : "15:00:00",
                    "nightStartTime": "22:00:00",
                    "nightEndTime" : "06:00:00",
                },
                "autoClockOut" : {
                    "type" : "DISABLE",
                    "fixedTime" : "18:00:00",
                    "relativeHour" : "08"
                },
                "autoSetWorkTime" : {}
            },
            "restperiods" : [
                {"name" : AdminLang["점심시간"], "startTime" : "12:00:00", "endTime" : "13:00:00"}
            ],
            "deviceSetting" : {
                "alowDevice" : ["PC_WEB"],
                "useMobileGps" : false
            },
            "circleSetting" : {
                "accessSetting" : "black",
                "accessTarget" : {},
                "exceptionTarget" : {}
            },
            "usagePeriod" : {
                "usePeriodSetting" : false
            },
            "consensusHoursPerDay" : "00"
        },
        isAutoClockOutDisable : function() {
            return "DISABLE" == this.getAutoClockOutType();
        },
        isAutoClockOutFixedTime : function() {
            return "FIXED_TIME" == this.getAutoClockOutType();
        },
        isAutoClockOutRelativeTime : function() {
            return "RELATIVE_TIME" == this.getAutoClockOutType();
        },
        getFixedOption : function() {
            return this.get("fixedOption");
        },
        getWorkDay : function() {return JSON.parse(this.getFixedOption()["workDay"]);},
        isIgnoreBeforeStart : function(){return this.getFixedOption()["autoSetWorkTime"]["ignoreBeforeStart"];},
        isIgnoreAfterStart : function(){return this.getFixedOption()["autoSetWorkTime"]["ignoreAfterStart"];},
        isIgnoreAfterEnd : function(){return this.getFixedOption()["autoSetWorkTime"]["ignoreAfterEnd"];},
        getAutoClockOutType : function(){return this.getFixedOption()["autoClockOut"]["type"];},
        getTime : function(HHMMSS){
            if (!HHMMSS) {
                return {
                    hour : null,
                    minute : null,
                    second : null
                }
            }
            var timeArr = HHMMSS.split(":");
            return {
                hour : timeArr[0],
                minute : timeArr[1],
                second : timeArr[2]
            }
        },
        getWorkStartTime : function(){
            return this.getFixedOption()["workTimeRange"]["workStartTime"];
        },
        isWorkStartHour :   function(hour){ return this.getTime(this.getWorkStartTime()).hour == hour;},
        isWorkStartMinute : function(minute){ return this.getTime(this.getWorkStartTime()).minute == minute;},
        isWorkStartSecond : function(second){ return this.getTime(this.getWorkStartTime()).second == second;},
        getWorkEndTime : function(){
            return this.getFixedOption()["workTimeRange"]["workEndTime"];
        },
        isWorkEndHour :   function(hour){ return   this.getTime(this.getWorkEndTime()).hour == hour;},
        isWorkEndMinute : function(minute){ return this.getTime(this.getWorkEndTime()).minute == minute;},
        isWorkEndSecond : function(second){ return this.getTime(this.getWorkEndTime()).second == second;},

        getDutyStartTime : function() {
            return this.getFixedOption()["workTimeRange"]["dutyStartTime"];
        },
        isDutyStartHour :   function(hour){ return this.getTime(this.getDutyStartTime()).hour == hour;},
        isDutyStartMinute : function(minute){ return this.getTime(this.getDutyStartTime()).minute == minute;},
        isDutyStartSecond : function(second){ return this.getTime(this.getDutyStartTime()).second == second;},
        getDutyEndTime : function() {
            return this.getFixedOption()["workTimeRange"]["dutyEndTime"];
        },
        isDutyEndHour :   function(hour){ return this.getTime(this.getDutyEndTime()).hour == hour;},
        isDutyEndMinute : function(minute){ return this.getTime(this.getDutyEndTime()).minute == minute;},
        isDutyEndSecond : function(second){ return this.getTime(this.getDutyEndTime()).second == second;},
        enableDutyTime : function() {
            return this.getFixedOption()["workTimeRange"]["enableDutyTime"];
        },
        getAutoClockOutFixedTime : function(){
            return this.getFixedOption()["autoClockOut"]["fixedTime"];
        },

        isConsensusHoursPerDay : function(hour){ return this.get('consensusHoursPerDay') == hour;},

        isAutoClockOutFixedTimeHour :   function(hour){  return this.getTime(this.getAutoClockOutFixedTime()).hour == hour;},
        isAutoClockOutFixedTimeMinute : function(minute){return this.getTime(this.getAutoClockOutFixedTime()).minute == minute;},
        isAutoClockOutFixedTimeSecond : function(second){return this.getTime(this.getAutoClockOutFixedTime()).second == second;},
        isAutoClockOutRelativeTimeHour : function (hour) { return this.getFixedOption()["autoClockOut"]["relativeHour"] == hour;},

        getNightStartTime : function(){
            return this.getFixedOption()["workTimeRange"]["nightStartTime"]
        },

        isNightStartHour : function(hour){     return this.getTime(this.getNightStartTime()).hour == hour;},
        isNightStartMinute : function(minute){ return this.getTime(this.getNightStartTime()).minute == minute;},
        isNightStartSecond : function(second){ return this.getTime(this.getNightStartTime()).second == second;},

        getNightEndTime : function(){
            return this.getFixedOption()["workTimeRange"]["nightEndTime"];
        },

        isNightEndHour : function(hour){ return this.getTime(this.getNightEndTime()).hour == hour;},
        isNightEndMinute : function(minute){ return this.getTime(this.getNightEndTime()).minute == minute;},
        isNightEndSecond : function(second){ return this.getTime(this.getNightEndTime()).second == second;},

        isMobileAllow : function(){return _.contains(this.get("deviceSetting")["allowDevice"], "MOBILE")},
        isFixedWorkingTimeType : function() {return "FIXED_WORKING_TIME" == this.getWorkingType();},
        isFlexibleWorkingTimeType : function() {return "FLEXIBLE_WORKING_TIME" == this.getWorkingType();},
        isSelectiveWorkingTimeType : function() {return "SELECTIVE_WORKING_TIME" == this.getWorkingType();},

        getWorkingType : function() {
            return this.get("workingType");
        },
        getWorkingTimeRange : function(){
            if(this.isFlexibleWorkingTimeType()){
                return "자유출퇴근";
            }

            return this.get("fixedOption")["workTimeRange"]["workStartTime"] + " ~ " + this.get("fixedOption")["workTimeRange"]["workEndTime"];
        },
        isExpired : function() {
            if(!this.usePeriodSetting()){
                return false;
            }

            var currentDate = GO.util.customDate(new Date(), "YYYY-MM-DD");

            return currentDate > this.get("usagePeriod")["endDate"];
        },
        usePeriodSetting : function(){
            return this.get("usagePeriod")["usePeriodSetting"];
        },
        useMobileGps : function () {return this.get("deviceSetting")["useMobileGps"];},
        usePeriodSetting : function() {return this.get("usagePeriod")["usePeriodSetting"];},
        getPeriodStartDate : function () {
            return GO.util.customDate(this.get("usagePeriod")["startDate"], "YYYY-MM-DD");
        },
        getPeriodEndDate : function() {
            return GO.util.customDate(this.get("usagePeriod")["endDate"], "YYYY-MM-DD");
        },
        isDefaultGroup : function() {
            return this.get("defaultGroup");
        },
        isAccessBlack : function() {
            return this.get("circleSetting")["accessSetting"] == "black";
        },
        isAccessWhite : function() {
            return this.get("circleSetting")["accessSetting"] == "white";
        },
        useWarningCheck : function() {
            return this.get('warningCheck');
        },
        usePrivateIpAutoSave : function () {
            return this.get("deviceSetting")["privateIpAutoSave"];
        },
        save: function (variables, options) {
            if (!this.validation(variables)) {
                return;
            }
            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            return Backbone.Model.prototype.save.call(this, variables, options);
        },

        validation : function(variables) {
            if (!variables.name) {
                $.goMessage(TimelineLang['그룹명은 필수입니다.']);
                return false;
            }
            for (var index in variables.restperiods) {
                var restPeriod = variables.restperiods[index];
                if (!restPeriod.name) {
                    $.goMessage(TimelineLang['휴게시간명은 필수입니다.']);
                    return false;
                }

                if (restPeriod.startTime > restPeriod.endTime) {
                    $.goMessage(TimelineLang['휴게 종료시간이 시작시간보다 빠를 수 없습니다. 휴게시간을 확인해주세요.']);
                    return false;
                }
            }
            return true;
        }

    });

    return GroupModel;
});
