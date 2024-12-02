define(
    [
        "backbone",
        "report/models/series_report"
    ],

    function(
            Backbone,
            SeriesReportModel
    ) { 
        
        var ReportTodos = Backbone.Collection.extend({
            model : SeriesReportModel,
            url: GO.contextRoot + "api/report/undone"
        }, {
            fetch: function(opt) {
                var instance = new ReportTodos();
                if(opt){
                    return instance.fetch({async:true, success : opt.success});
                }else{
                    instance.fetch({async:false});
                    return instance;
                }
            }
        });
    
        return ReportTodos;
    }
);