define([
    "backbone"
],
function(Backbone) {
    var AttendStatus = Backbone.Model.extend({
    	
    	initialize : function(options) {
    		this.name = options.name;
    		this.status = options.status;
		},
		
		defaults : {
			name : this.name,
			status : this.status
		}
    }); 
    return AttendStatus;
});
