define([
	"jquery",
    "backbone",
    "attendance/models/status"
],

function(
		$,
        Backbone,
        Status
) { 
    var Statuses = Backbone.Collection.extend({
    	
    	model : Status,
    	
        initialize : function() {
        },
        
        get : function() {
        	var statuses = new Statuses();
        	this.each(function(m) {
        		statuses.add(m);
            });
        	return statuses;
        },

        getById: function(id) {
            return this.find(function(m) {
            	if (m.id == id) {
            		return m;
            	}
            });
        }
    });

    return Statuses;
});