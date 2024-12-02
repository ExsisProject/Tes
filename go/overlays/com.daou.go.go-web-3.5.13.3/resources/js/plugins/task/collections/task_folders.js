define(
    [
        "backbone"
    ],

    function(
            Backbone
    ) { 
    	var Folder = Backbone.Model.extend({});
    	
        var Folders = Backbone.Collection.extend({
            model : Folder,
            
            
            initialize : function() {
//            	this.deptId = data.deptId;
            },
            
            
            url : function() {
            	return GO.contextRoot + "api/task/folder/dept/" + this.deptId + "/low";
            },
            
            
            isOneFolder : function() {
            	return this.models.length == 1;
            },
            
            
            first : function() {
            	return this.models[0];
            },
            
            
            setDeptId : function(deptId) {
            	this.deptId = deptId;
            },
            
            
            getIds : function() {
            	return _.map(this.models, function(folder) {
            		return folder.id;
            	});
            }
        });
    
        return Folders;
    }
);