define(
    [
      "backbone"
    ],
    
    function(
            Backbone
        ) { 
        var ReportCollection = Backbone.Collection.extend({
            initialize : function(models, options){
                this.folderId = options.folderId;
                this.conditions = options.conditions || this.conditions;
            },
            url: function(){
                return GO.contextRoot + "api/report/folder/" + this.folderId + "/reports";
            },
            conditions: {
                page: 0, 
                offset: 20,
                property : "closedAt",
                direction : "desc"
            }
        }, {
            fetch: function(options) {
                var instance = new ReportCollection([], {folderId : options.folderId , conditions : options.conditions});
                    instance.fetch({async:false, data : instance.conditions});
                
                return instance;
            }
        });
    
    return ReportCollection;
    
    }
);