define(function() {
	var DateTime = Backbone.Model.extend({
			
		initialize : function(options) {
			var startDate = options.startDate || this._defaultStartDate();
			var startTime = options.startTime || this._defaultStartTime().format("HH:mm");
			var startDateTime = options.startDateTime || this.getStartDateTime(startDate, startTime);
			var endDate = options.endDate || this._defaultStartDate();
			var endTime = options.endTime || this._defaultStartTime().add("hours", 1).format("HH:mm");
			var endDateTime = options.endDateTime || this.getEndDateTime(endDate, endTime);
			
			this.set("startDateTime", startDateTime);
			this.set("endDateTime", endDateTime);
		},
		
		getStartDateTime : function(date, time) {
			return moment((date || this.getStartDate()) + "T" + (time || this.getStartTime()) + ":00");
		},
		
		getEndDateTime : function(date, time) {
			return moment((date || this.getEndDate()) + "T" + (time || this.getEndTime()) + ":00");
		},
		
		parseTime : function(time) {
			if (!time) return "";
        	
        	var pattern = /[^(0-9)]/gi;
            time = time.replace(pattern, ""); 
        	time = time.substr(0, 4);
        	var first = time.substr(0, 1);
        	
        	if (parseInt(first) > 2) time = "0" + time.substr(0, 3);
        	
        	var parsedTime = time;
        	var firstHalf= parsedTime.substr(0, 2);
        	var secondHalf = parsedTime.substr(2, 2);
        	
        	if (secondHalf.length == 0) secondHalf = "00";
        	if (secondHalf.length == 1) secondHalf = "0" + secondHalf;
        	
        	var isValid = parseInt(firstHalf) <= 23 && parseInt(firstHalf) >= 0 && parseInt(secondHalf) <= 59 && parseInt(secondHalf) >= 0;
        	
        	if (isValid) {
        		parsedTime = firstHalf + ":" + secondHalf;
        	} else {
        		parsedTime = GO.util.hourMinute();
        	}
        	
        	return parsedTime;
		},
		
		getStartDate : function() {
			return this.get("startDateTime").format("YYYY-MM-DD");
		},
		
		getEndDate : function() {
			return this.get("endDateTime").format("YYYY-MM-DD");
		},
		
		getStartTime : function() {
			return this.get("startDateTime").format("HH:mm");
		},
		
		getEndTime : function() {
			return this.get("endDateTime").format("HH:mm");
		},
		
		validate : function(attrs) {
			if (attrs.endDateTime.diff(attrs.startDateTime, "minutes") < 0 ) {
				return "end time can not be smaller than the start time";
			}
		},
		
		_defaultStartDate : function() {
			return moment().format("YYYY-MM-DD");
		},
		
		_defaultStartTime : function() {
			var date = moment(new Date);
			var baseDate = date.isSame(new Date, "day") ? date : date.clone().startOf("day");
			var baseSecond = 1800;
			var parseSecond = baseDate.valueOf() / 1000;
	        var parseMinute = Math.floor(parseSecond) / baseSecond;
	        var ceilAndParseSecond = Math.ceil(parseMinute) * baseSecond;
	
	        return moment(ceilAndParseSecond * 1000);
		},
	});
	
	return DateTime;
});