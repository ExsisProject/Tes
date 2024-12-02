define(
    [
      "backbone"
    ],
    
    function(
            Backbone
        ) { 
        var ReportRecentList = Backbone.Collection.extend({
            url: GO.contextRoot + "api/report/done"
        }, {
            fetch: function(opt) {
                var instance = new ReportRecentList();
                if(opt){
                    return instance.fetch({async:true, success : opt.success});
                }else{
                    instance.fetch({async:false});
                    return instance;
                }
            }
        });
    
    return ReportRecentList;
    
    }
);