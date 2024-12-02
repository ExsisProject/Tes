define(
    [
        "backbone",
        "task/models/task_activity"
    ],

    function(
            Backbone,
            TaskActivityModel
    ) { 
        
        var TaskActivities = Backbone.Collection.extend({
            model : TaskActivityModel,
            
            
            initialize : function(data) {
            	this.taskId = data.taskId;
            },
            
            
            url : function() {
            	return GO.contextRoot + "api/task/" + this.taskId + "/activity";
            }
        });
    
        return TaskActivities;
    }
);