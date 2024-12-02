define({
	"system": {
		"INSTANCETYPE_APP": "app", 
		"INSTANCETYPE_ADMIN": "admin",
		"DEVICETYPE_PC": "pc", 
		"DEVICETYPE_MOBILE": "mobile",
		"AJAX_TIMEOUT": 30000,  
		"COOKIE_EXPIRES" : 30, 
		"COOKIE_PATH" : "/"
	}, 

	"cache": {
	    "DESTROY_TIME": 300
	}, 
	
	"response": {
	    "BAD_REQUEST": 400, 
	    "UNAUTHORIZED": 401, 
	    "FORBIDDEN": 403, 
	    "NOT_FOUND": 404,
	    "INTERNAL_SERVER_ERROR": 500,
		"SERVER_CHECK": 503
	}, 
	
	"mail": {
		"ROOT_PATH": "/", 
		"STATUS_ENABLED": "enabled"
	}, 

	"calendar": {
        "FEED_STATE"			: {"waiting": "waiting", "following": "following"}, 
        "SIDE_TYPE"				: {"calendar": "calendar", "feed": "feed"}, 		
		"RECURRENCE_FREQ"		: {"daily": "DAILY", "monthly": "MONTHLY", "weekly": "WEEKLY", "yearly": "YEARLY"}, 
		"EVENT_CHANGE_CAL_TYPE"	: "change:calendar-type", 
		"EVENT_SHOW_CAL" 		: "show:calendar", 
		"EVENT_HIDE_CAL"        : "hide:calendar", 
        "EVENT_CHANGED_COLOR"   : "changed:calendar-color", 
        "EVENT_SHOW_EVENT"		: "request:show-event", 
        "EVENT_CREATE_EVENT"	: "request:create-event", 
        "EVENT_REMOVE_EVENT"	: "request:remove-event"
	}
});