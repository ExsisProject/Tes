define([
    "backbone"
],

function(
		Backbone 
) {	
	var Collection = GO.BaseCollection.extend({
		initialize : function() {
			this.addWeek = 0;
		},
		
		url: function() {
			return GO.config("contextRoot") + "api/calendar/event/daily?addWeek=" + this.addWeek + "&" + $.param(this.conditions)+ "&" + $.param(this.calendars);
		},
		
		setConditions : function(options){
			this.setAddWeek(options.addWeek || 0);
			this.conditions = {
				year : options.year,
				month : options.month
			};

			this.calendarId = options.calendarId;
			this.calendars = {};
			this.calendars['calendarIds'] = options.calendarIds;
            this.calendars['includingAttendees'] = options.includingAttendees;
		},
		
		setAddWeek : function(addWeek) {
			this.addWeek = addWeek;
		}
	});
	
	return {
		// deprecated!!
		getCollection: function(opt) {
			var collection = this.init(opt);
			collection.fetch({
				async:true ,
				type: 'GET',
				contentType:'application/json',
				reset: true
			});
			return collection;
		},
		init : function(opt) {
			var collection = new Collection();
			collection.setConditions(opt);
			
			return collection;
		}
	};
	
});