define(
    [
        "backbone"
    ],

    function(
            Backbone
    ) { 
    	
        var Department = Backbone.Model.extend({});
        
        var Departments = Backbone.Collection.extend({
            model : Department,
            
            
            initialize : function() {
            },
            
            
            url : function() {
            	return GO.contextRoot + "api/task/folder/dept/low";
            },
            
            
            isOneTeam : function() {
            	return this.models.length == 1;
            },
            
            
            first : function() {
            	return this.models[0];
            }
        });
    
        return Departments;
    }
);