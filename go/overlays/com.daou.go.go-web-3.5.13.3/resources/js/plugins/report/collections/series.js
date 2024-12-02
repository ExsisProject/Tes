define(
    [
      "backbone",
      "report/models/series_report"
    ],
    
    function(
            Backbone,
            SeriesReportModel
        ) { 
        var SeriesCollection = Backbone.Collection.extend({
            model : SeriesReportModel,
            
            initialize : function(models, options){
                this.folderId = options.folderId;
                this.conditions = options.conditions || this.conditions;
            },
            
            url: function(){
                return GO.contextRoot + "api/report/folder/" + this.folderId + "/series";
            },
            
            conditions: {
                page: 0, 
                offset: 20,
                property : "closedAt",
                direction : "desc"
            }
        }, {
            fetch: function(options) {
                var instance = new SeriesCollection([], {folderId : options.folderId , conditions : options.conditions});
                    instance.fetch({async:false, data : instance.conditions});
                return instance;
            }
        });
    
    return SeriesCollection;
    
    }
);