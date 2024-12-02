define("timeline/models/timeline_group", function(require){
    var Backbone = require("backbone");
    var GO = require("app");
    
    var TimelineGroup= Backbone.Model.extend({

        initialize: function () {
            this.id = this.get('id');
            this.workingType = this.get('workingType');
            this.name = this.get('name');
            this.restPeriods = this.get('restperiods');
            this.fixedOption = this.get('fixedOption');
            this.startTime = this.get('workingStartTime')
            this.endTime= this.get('workingEndTime')
        },
        isDutyStartTime:function(hour, min){
            if (!this.fixedOption || !this.fixedOption.workTimeRange || !this.fixedOption.workTimeRange.enableDutyTime){
                return false;
            }
            var dutyStartTime = this.fixedOption.workTimeRange.dutyStartTime;
            if (!dutyStartTime){
                dutyStartTime = this.startTime;
            }
            return this.isTime(hour, min,dutyStartTime);
        },
        isDutyEndTime:function(hour, min){
            if (!this.fixedOption || !this.fixedOption.workTimeRange || !this.fixedOption.workTimeRange.enableDutyTime){
                return false;
            }
            var dutyEndTime = this.fixedOption.workTimeRange.dutyEndTime;
            if( !dutyEndTime){
                dutyEndTime = this.endTime;
            }
            return this.isTime(hour, min,dutyEndTime);
        },
        isRestTime:function(hour, min){
            var self = this;
            var rest = false;

            _.forEach(this.restPeriods, function(period){
                rest |= self.isIncludeTime(hour, min, period.startTime, period.endTime);
            });
            return !!rest  ;
        },
        isDutyTime:function(hour, min){
            if(!this.fixedOption || !this.fixedOption.workTimeRange){
                return false;
            }
            return this.isIncludeTime(hour, min,this.fixedOption.workTimeRange.dutyStartTime, this.fixedOption.workTimeRange.dutyEndTime);
        },
        isWorkTime:function(hour, min){
            if(!this.fixedOption || !this.fixedOption.workTimeRange){
                return true;
            }

            return this.isIncludeTime(hour, min,this.fixedOption.workTimeRange.workStartTime, this.fixedOption.workTimeRange.workEndTime);
        },
        isNightTime:function(hour, min){
            if(!this.fixedOption || !this.fixedOption.workTimeRange){
                return false;
            }

            return this.isIncludeTime(hour, min,this.fixedOption.workTimeRange.nightStartTime, this.fixedOption.workTimeRange.nightEndTime);
        },
        isTime:function(hour, min, timeStr){
            var standardTime = this.time(hour, min, 0);
            var startTime= this.strToTime(timeStr);
            var endTime = startTime + ( 1000 * 60 * 10 );

            return startTime <= standardTime  && standardTime < endTime;
        },
        isIncludeTime:function(hour, min, startStr, endStr){
            var standardTime = this.time(hour, min, 0);
            var startTime = this.strToTime(startStr);
            var endTime = this.strToTime(endStr);
            return startTime <= standardTime  && standardTime < endTime;
        },
        time:function(hour, min, sec){
            return (hour * 1000 * 60 * 60 ) + (min * 1000 * 60 ) + (sec * 1000);
        },
        strToTime:function(str){
            if(!!!str){ return 0; }
            return this.time(this.hour(str), this.min(str), this.sec(str));
        },
        hour:function(str){
            return str.split(':')[0];
        },
        min:function(str){
            return str.split(':')[1];
        },
        sec:function(str){
            return str.split(':')[2];
        },


    });

    return TimelineGroup;
});
