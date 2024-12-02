define([
    "backbone"
],
function(Backbone) {
    var TaskState = Backbone.Model.extend({
    	
    	initialize : function(options) {
    		this.id = options.id;
    		this.name = options.name;
		},
		
		defaults : {
			name : this.name,
			start : false,
			end : false,
			doing : false
		},
		
		isEnd : function() {
			return this.get("end");
		},
		
		isStart : function() {
			return this.get("start");
		},
		
		isDoing : function() {
			return this.get("doing");
		}
    }); 
    return TaskState;
});
