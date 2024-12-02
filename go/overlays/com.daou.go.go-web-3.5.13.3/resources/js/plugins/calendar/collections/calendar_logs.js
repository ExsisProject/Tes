define(
    [
        "backbone"
    ],

    function(
            Backbone
    ) { 
        
    	var LogModel = Backbone.Model.extend({
    		initialize : function() {},
    		
    		contentParser : function() {
    			return this.get("message").split("\n");
    		}
    	});
    	
        var Logs = Backbone.Collection.extend({
            model : LogModel,
            
            
            initialize : function(options) {
            	this.calendarId = options.calendarId;
            	this.eventId = options.eventId;
            	this.options.page = 0;
            	this.options.offset = 5;
            },
            
            options : {
            		page : 0,
            		offset : 5            		
            },
            
            url : function() {
            	return GO.contextRoot + "api/calendar/" + this.calendarId + "/event/" + this.eventId + "/log?" + $.param(this.options);
            },            
            
            setPage : function(page) {
            	this.options.page = page;
            }
        });
    
        return Logs;
    }
);