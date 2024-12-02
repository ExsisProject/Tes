define(
    [
      "backbone",
      "report/models/series_report"
    ],
    
    function(
            Backbone,
            ReportSeriesModel
        ) { 
        var ReportMenu = Backbone.Collection.extend({
            url: GO.contextRoot+"api/report/department",
            model : ReportSeriesModel
        }, {
            get: function(opt) {
                var instance = new ReportMenu();
                instance.fetch({async:false});
                return instance;
            },
            
            create : function(opt){
            	var instance = new ReportMenu(opt);
            	return instance;
            }
        });
        return ReportMenu;
    }
);