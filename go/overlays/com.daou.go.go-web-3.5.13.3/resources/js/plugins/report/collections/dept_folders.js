define(
    [
        "backbone",
        "report/models/report_folder"
    ],

    function(
            Backbone,
            ReportFolderModel
    ) { 
        
        var DeptFolders = Backbone.Collection.extend({
            model : ReportFolderModel,
            initialize : function(models, options){
                this.deptId = options.id;
                this.status = options.status || "active";
            },
            url: function(){
                return GO.contextRoot + "api/report/department/"+ this.deptId +"/" + this.status;
            },
            
        }, {
            fetch: function(options) {
                var instance = new DeptFolders([], {id : options.id, status : options.status});
                instance.fetch({async:false});
                return instance;
            }
        });
    
        return DeptFolders;
    }
);