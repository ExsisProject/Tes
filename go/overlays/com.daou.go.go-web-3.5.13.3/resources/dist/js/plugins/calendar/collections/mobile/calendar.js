define(["backbone"],function(e){var t=GO.BaseCollection.extend({initialize:function(){this.addWeek=0},url:function(){return GO.config("contextRoot")+"api/calendar/event/daily?addWeek="+this.addWeek+"&"+$.param(this.conditions)+"&"+$.param(this.calendars)},setConditions:function(e){this.setAddWeek(e.addWeek||0),this.conditions={year:e.year,month:e.month},this.calendarId=e.calendarId,this.calendars={},this.calendars.calendarIds=e.calendarIds,this.calendars.includingAttendees=e.includingAttendees},setAddWeek:function(e){this.addWeek=e}});return{getCollection:function(e){var t=this.init(e);return t.fetch({async:!0,type:"GET",contentType:"application/json",reset:!0}),t},init:function(e){var n=new t;return n.setConditions(e),n}}});