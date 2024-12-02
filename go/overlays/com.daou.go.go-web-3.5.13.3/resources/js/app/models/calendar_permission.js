(function() {
    define([
        "underscore", 
        "backbone"
    ], 
    
    function(
        _, 
        Backbone
    ) { 
        var CalendarPermission = Backbone.Model.extend({
           url: function() {
        	   return "/api/calendar/permission/user/"+this.get('userId')+"/calendar";
           }
        });
        
        return CalendarPermission;
    });
}).call(this);