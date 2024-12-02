define([
	"backbone",
	"attendance/collections/statuses",
	"attendance/models/status",
	"i18n!attendance/nls/attendance"
],

function(
	Backbone,
	Statuses,
	Status,
	AttndLang
) {
	var instance = null;
	var Record = Backbone.Model.extend({
		defaults : {
			
		},
		initialize : function() {
		    console.info();
    	},
		hasUserClockInTime : function() {
		    return convertTime.call(this, this.get("clockInTime"), 'HH:mm:ss');
        },
        
        hasUserClockOutTime : function() {
            return convertTime.call(this, this.get("clockOutTime"), 'HH:mm:ss');
        },
        
        isDayOff : function() {
        	return (this.isSunday() || this.isSatday() || this.isHoliday());
        },
        
        isHoliday : function() {
        	return this.get('holiday');
        },
        getWorkingTime : function() {
        	return this.get('workingTime');
        },
        getOfficailClockInTime : function() {
        	return this.get('group').clockInTime;
        },
        getOfficailClockOutTime : function() {
        	return this.get('group').clockOutTime;
        },
        useFlexibleTime : function() {
        	return this.get('group').useFlexibleTime;
        },
        isLate : function() {
        	return this.get('late');
        },
        isToday : function() {
        	return moment().isSame(this.get('logDate'), 'day');
        },
        isAfter : function() {
        	return moment().add(-1, 'days').isBefore(this.get('logDate'), 'day'); //현재날짜가 logDate보다 이전이면 logDate는 미래
        },
        isBefore : function() {
        	return moment().isAfter(this.get('logDate'), 'day'); //현재날짜가 logDate보다 이후이면 logDate는 과거
        },
        hasDateStatus : function () {
        	var value = false;
        	_.each(this.get('statuses'), function(status) {
        		if(status.companyStatus.type == 'date') {
        			value = true;
        		}
        	}, this);
        	return value;
        },
        isClockInTimeEdited : function() {
        	return this.get('editedClockInTime');
        },
        isClockOutTimeEdited : function() {
        	return this.get('editedClockOutTime');
        },
        hasId : function() {
        	return this.get('id');
        },
        getStatuses : function() {
        	return this.get('statuses');
        },

        getUseAllNight : function() {
            return this.get('useAllNight');
        },
        
        getStatusCnt : function(){
            var statues = this.getStatuses()
            return _.isUndefined(statues) ? 0 : statues.length; 
        },
        
        getGroup : function() {
        	return this.get('group');
        },
        getStatusById: function(id) {
        	return _.find(this.get('statuses'), function(status){
        		if(status.id == id) {
        			return status;	
        		}
        	});
        },
       
        getLogDate : function() {
        	return this.get('logDate');
        },
        getLogDateMMddDD : function() {
            return moment(this.get('logDate')).format('MM-DD (dd)');
        },
        getUserClockInIP : function() {
            return this.get('clockInIp');
        },
        getUserClockOutIP : function() {
            return this.get('clockOutIp');
        },
        getUserClockInGPS : function() {
            return this.get('clockInLatitude') + "," + this.get('clockInLongitude');
        },
        getUserClockOutGPS : function() {
            return this.get('clockOutLatitude') + "," + this.get('clockOutLongitude');
        },

        getUserClockInTime : function() {
			var time = this.get('clockInTime') || 0;
			if (time) { return moment(time).zone(time).format('HH:mm:ss');}
			else {return '';}
        },
        getUserClockOutTime : function() {
        	var time = this.get('clockOutTime') || 0;
			if (time) { return moment(time).zone(time).format('HH:mm:ss');}
			else {return '';}
        },
        getUserWorkingTime : function() {
        	var value = this.get('workingTime');
        	if (! value || 0) {
        		return '';
        	}
        	var time = moment.duration(value, 'seconds');
        	var hour = time.hours() + (time.days()*24) + "";
        	var min = time.minutes() + "";
        	var sec = time.seconds() + "";
        	
        	return padLeft(hour) + ':' + padLeft(min) + ':' + padLeft(sec);
        },
        
        getUserWorkingTimeHHMM : function(){
            var value = this.get('workingTime');
            if (! value || 0) {
                return '';
            }
            var time = moment.duration(value, 'seconds');
            var hour = time.hours() + (time.days()*24) + "";
            var min = time.minutes() + "";
            
            return padLeft(hour) + ':' + padLeft(min);
        },
        
        isSunday : function() {
        	return moment(this.get('logDate')).day() === 0;
        },
        isSatday : function() {
        	return moment(this.get('logDate')).day() === 6;
        },

        isUseAllNight: function() {
            return this.get('useAllNight');
        },

        setClockInTime : function(hour, min, sec) {
            var clockInTime = GO.util.toISO8601(moment(this.getLogDate()).set('hour',hour).set('minute', min).set('seconds', sec))
        	this.set('clockInTime', clockInTime);
            this.syncTimeZone('clockInTime', 'clockOutTime');
        },
        setClockOutTime : function(hour, min, sec, allNight) {
            var date = moment(this.getLogDate()).set('hour',hour).set('minute', min).set('seconds', sec);
            if(allNight){
                date.add(1, 'day');
            }
            var clockOutTime = GO.util.toISO8601(date);
        	this.set('clockOutTime', clockOutTime);
            this.set('useAllNight', allNight);
            this.syncTimeZone('clockOutTime', 'clockInTime');
        },


        
        // 출/퇴근 수정에 대한 TimeZone Sync (서버에서 TimeZone header값을 통해 시간을 변경하기 때문)
        syncTimeZone : function(source, target){
            var sourceTime = this.get(source);
            var targetTime = this.get(target);
            
            if(targetTime == null){
                return;
            }
            
            var targetTimeMoment = moment(targetTime);
            var sourceTimeZoneOffset = - moment(sourceTime)._tzm;
            var targetTimeZoneOffset = - targetTimeMoment._tzm;
            var zoneMinuteOffset = targetTimeZoneOffset - sourceTimeZoneOffset;
            
            targetTimeMoment.add(zoneMinuteOffset, 'minutes');
            
            this.set(target, GO.util.toISO8601(targetTimeMoment));
        },
        
        convertStatausTime : function(status){
            if(status.companyStatus.type == 'date') {
                return;
            }
            if(status.companyStatus.type == 'allNight') {
                return status.companyStatus.name;
            }
            return moment(status.startDate).zone(status.startDate).format('HH:mm') + '~' + moment(status.endDate).zone(status.startDate).format('HH:mm');
        },
        
        getUserClockInTimeHHMM : function(){
            if(_.isUndefined(this.get("id"))){
                return "";
            }
            
            if(this.get("clockInTime") == null){
                if(this.isAfter()){
                    return "";
                }else{
                    return "-";
                }
            }
            
            return convertTime.call(this, this.get("clockInTime"), 'HH:mm');
        },
        
        getUserClockOutTimeHHMM : function(){
            if(_.isUndefined(this.get("id"))){
                return "";
            }
            
            if(this.get("clockOutTime") == null){
                if(this.isAfter()){
                    return "";
                }else{
                    return "-";
                }
            }
            
            return convertTime.call(this, this.get("clockOutTime"), 'HH:mm');
        },
        
        isWorkingDay : function(){
        	return this.get("workingDay");
        }
	});
	
	function padLeft(str){
	    var pad = "00";
	    return pad.substring(0, pad.length - str.length) + str;
	}
	
	function convertTime(inputTime , format){
        var time = inputTime || 0;
        if (time) { return moment(time).zone(time).format(format)}
        else {return time;}
	}

	return Record;
	
});
