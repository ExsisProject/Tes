define(
    [
        "backbone",
        "report/models/report"
    ],

    function(
            Backbone,
            Report
    ) { 
        var SeriesReports = Backbone.Collection.extend({
            model : Report,
            
            
            initialize : function(options) {
            	this.seriesId = options.seriesId;
            },
            
            
            url: function() {
            	return GO.contextRoot + "api/report/series/" + this.seriesId + "/reports";	
            }
            
        });
    
        return SeriesReports;
    }
);