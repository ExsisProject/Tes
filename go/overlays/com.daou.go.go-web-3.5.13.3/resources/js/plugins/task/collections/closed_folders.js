define(
    [
        "backbone",
        "task/models/task_folder",
        "collections/paginated_collection"
    ],

    function(
            Backbone,
            TaskFolderModel,
            PaginatedCollection
    ) { 
        
        var ClosedFolders = PaginatedCollection.extend({
            model : TaskFolderModel,
            
            url: function() {
    			return GO.contextRoot + "api/task/folder/stop?" + this.makeParam();
            }
        });
    
        return ClosedFolders;
    }
);