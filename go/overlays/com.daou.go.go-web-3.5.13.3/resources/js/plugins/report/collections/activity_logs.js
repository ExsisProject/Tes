define(
    [
        "backbone",
        "report/models/activity_log"
    ],

    function(
            Backbone,
            ActivityLogModel
    ) { 
        
        var ActivityLogsCollection = Backbone.Collection.extend({
            model : ActivityLogModel,
            initialize : function(models, options){
                this.seriesId = options.id;
            },
            url: function(){
                return GO.contextRoot + "api/report/series/"+ this.seriesId +"/log";
            },
            
        }, {
            fetch: function(options) {
                var instance = new ActivityLogsCollection([], {id : options.id}),
                    page = options.page || 0,
                    offset = options.offset || 10;
                    
                instance.fetch({async:false, data : {page : page , offset : offset}});
                return instance;
            }
        });
    
        return ActivityLogsCollection;
    }
);