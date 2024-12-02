define([
    "backbone"
],

function(
        Backbone
) { 
    var CompanyStatuses = Backbone.Collection.extend({
    	
        initialize : function() {
        	
        },
        url : function() {
        	return GO.contextRoot + "api/ehr/attnd/company/statuses";
        }
    });

    return CompanyStatuses;
});