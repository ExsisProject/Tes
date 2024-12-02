define([
    "backbone"
],

function(Backbone) {
    var TaskDeptFolder = Backbone.Model.extend({
    	initialize : function(data) {
        	this.deptId = data.deptId;
        },
        
        
        url : function() {
        	return GO.contextRoot + "api/task/folder/dept/" + this.deptId;
        },
        
        
    	isEmptyfolder : function() {
    		return this.get("folders").length == 0; 
    	},
//    	
//    	
//    	createdAt : function() {
//    		return GO.util.basicDate2(this.get("createdAt"));
//    	},
//    	
//    	
    	getFolders : function() {
    		return _.filter(this.get("folders"), function(item) {
    			return item.separator == undefined;
    		});
    	},
    	
    	
    	getSeparators : function() {
    		return _.filter(this.get("folders"), function(item) {
    			return item.separator != undefined;
    		});
    	}
    }); 
    return TaskDeptFolder;
});