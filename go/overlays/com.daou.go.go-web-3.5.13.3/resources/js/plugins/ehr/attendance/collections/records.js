define([
    "backbone",
    "attendance/models/record"
],

function(
        Backbone,
        Record
) { 
	
    var Records = Backbone.Collection.extend({
        model : Record,
        
        
        initialize : function(options) {
        	this.options = options || {};
        	this.logMonth = this.options.month || 0;
        	this.userid = this.options.userid;
        },
        
        url : function() {
        	return GO.contextRoot + 'api/ehr/attnd/user/'+ this.userid +'/record/month/' + this.logMonth.format('YYYY-MM');
        },
        
        get : function(id) {
        	return this.models[id];
        },
        
        getByLogDate: function(logDate) {
        	return this.find(function(model) {
        		return model.get('logDate') == logDate;
        	});
        },
        
        getRecords : function() {
        	var month = this.logMonth;
        	var startDate = moment(month.format('YYYY-MM-DD')).startOf('month');
        	var endDate = moment(month.format('YYYY-MM-DD')).endOf('month');
        	var holidays = this.getHolidays(startDate.format('YYYY'));
        	
        	while (startDate < endDate) {
        		var isHoliday = false;
        		for(var day in holidays) {
        			var holiday = new moment(holidays[day].startTime);
        			if(holiday.format('MM-DD') == startDate.format('MM-DD')) {
        				isHoliday = true;
        			}
        				
        		}
        		var record = new Record({logDate : startDate.format('YYYY-MM-DD'), holiday : isHoliday});
        		var model = this.getByLogDate(record.get('logDate'));
        		if (!model) {
        			this.add(record);
        		}
        		startDate.add(1, 'days');
        	}
        	
        	var collection = this.sortBy(function(model){
        	    return model.get("logDate");
            });
        	
        	return new Records(collection);
        },
        
        getLateCount : function(){
            var lateCount = 0
            this.each(function(model){
                if(model.isLate()){
                    lateCount++;
                }
            });
            return lateCount;
        },
        
        sortByAttr : function(property, direction) { 
        	
        },
        
        getHolidays : function(year) {
			var holidayEvents = {};
            $.ajax({
                type: 'GET',
                async: false,
                dataType: 'json',
                url: GO.config("contextRoot") + 'api/calendar/event/holiday/' + year,
                success: function(resp) {
                    holidayEvents = resp.data;
                }
            });
            return holidayEvents;
		}
    });

    return Records;
});