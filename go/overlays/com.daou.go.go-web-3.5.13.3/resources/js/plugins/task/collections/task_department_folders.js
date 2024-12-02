define(
    [
        "backbone",
        "task/models/task_department_folder"
    ],

    function(
            Backbone,
            TaskDeptFolder
    ) { 
        var TaskDeptFolders = Backbone.Collection.extend({
            model : TaskDeptFolder,
            
            
            initialize : function(data) {
        		this.type = data.type;
        	},
        	
        	
            url : function() {
            	var options = this.type == "stop" ? "?" + $.param({size : 1}) : "";
            	return GO.contextRoot + "api/task/folder/" + this.type + options;
            },
            
            
            getFolders : function(deptId) {
            	if (!deptId) return [];
            	return this.get(deptId).get("folders");
            },
            
            
            getCurrentDept : function(deptId) {
            	if (deptId == null) return null;
            	return _.find(this.models, function(dept) {
					return dept.get("id") == deptId;
				});
            },
            
            
            isFolderType : function(type) {
            	return type == "folder"; 
            },
            
            
            isOneTeam : function() {
            	return this.models.length == 1;
            },
            
            
            firstTeam : function() {
            	return this.models[0];
            },
            
            
            folderPresent : function() {
            	var total = _.reduce(this.models, function(sum, dept) {
            		return sum + dept.get("folders").length;
            	}, 0);
            	
            	return total > 0;
            },
            
            
            deptPresent : function() {
            	return this.models.length ? true : false;
            }
        });
    
        return TaskDeptFolders;
    }
);